/**
 * Server API route: POST /api/hint
 * Env vars:
 * - OPENAI_API_KEY: required for contacting OpenAI (set in Vercel or .env.local)
 * - OPENAI_MODEL: optional, defaults to 'gpt-4o-mini'
 *
 * This route validates input, rate-limits by IP, optionally caches hints server-side,
 * and forwards a constrained prompt to the OpenAI Chat Completions endpoint.
 */

import { NextResponse } from "next/server";

const RATE_LIMIT_MAX = 10; // max requests
const RATE_LIMIT_WINDOW_MS = 60_000; // per minute
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

type HintRequest = {
  questionId?: string;
  text: string;
  choices?: string[];
  hintLevel?: number;
};

// In-memory rate limit store: ip -> timestamps[]
const rateMap = new Map<string, number[]>();

// Simple in-memory cache: key -> {hint, expiresAt}
const hintCache = new Map<string, { hint: string; expiresAt: number }>();

const SYSTEM_PROMPT = `You are an expert STEM tutor whose job is to help a student learn by giving short, targeted, non-spoiling hints.
Rules:
1. NEVER provide the final answer or do the calculation that yields the final numeric answer.
2. Provide only 1-3 short hint sentences for hint level 1, 2-4 short sentences for level 2, and at most 5 slightly more revealing sentences for level 3.
3. Prefer Socratic questions ("What happens if you isolate X?"), point to relevant concepts ("use conservation of energy", "consider derivative"), or give an example pattern (a small analogous equation) — BUT DO NOT solve the actual problem.
4. Include a one-line suggestion of the next step the student should try, not the solution.
5. If \`choices\` are provided and hintLevel=1, avoid naming the choice letters; nudge conceptually ("focus on the option that uses X").
6. Output only valid JSON with keys: {"hint": string} (no extra commentary). If the model would normally add fluff, do not allow it — only "hint".
7. If the question is ambiguous or missing data, ask one short clarifying question instead of guessing.`;

async function callOpenAI(systemPrompt: string, userMessage: string, model: string, apiKey: string, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 200,
      }),
    });

    const json = await res.json();
    return { ok: res.ok, json };
  } finally {
    clearTimeout(id);
  }
}

function getClientIp(req: Request) {
  // Try typical headers, otherwise fallback to unknown
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const arr = rateMap.get(ip) || [];
  const fresh = arr.filter((t) => now - t <= RATE_LIMIT_WINDOW_MS);
  fresh.push(now);
  rateMap.set(ip, fresh);
  return fresh.length > RATE_LIMIT_MAX;
}

function cacheKey(questionId: string, hintLevel: number) {
  return `${questionId}::${hintLevel}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const payload = body as HintRequest;
    if (!payload.text || typeof payload.text !== "string") {
      return NextResponse.json({ error: "Missing question text" }, { status: 400 });
    }

    if (payload.text.length > 3000) {
      return NextResponse.json({ error: "Text too long" }, { status: 413 });
    }

    const hintLevel = Math.max(1, Math.min(3, Number(payload.hintLevel) || 1));

    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const apiKey = process.env.OPENAI_API_KEY;
    const qid = payload.questionId;

    // Check server cache if available
    if (qid) {
      const key = cacheKey(qid, hintLevel);
      const hit = hintCache.get(key);
      if (hit && hit.expiresAt > Date.now()) {
        if (process.env.NODE_ENV === "development") console.debug("hint cache hit", key);
        return NextResponse.json({ hint: hit.hint, hintLevel, model });
      }
    }

    if (!apiKey) {
      // Fallback hint if API key not configured
      const fallback = { hint: "(Hint service not configured) Try breaking the problem into smaller parts and identify the governing principle.", hintLevel, model: "none" };
      return NextResponse.json(fallback, { status: 503 });
    }

    // Build user message
    const userMsg = `Provide a hint for the following question. hintLevel=${hintLevel}. Question text: "${payload.text}".` +
      (payload.choices ? ` Choices: ${JSON.stringify(payload.choices)}.` : "");

    if (process.env.NODE_ENV === "development") console.debug("Calling OpenAI model", model, "for hintLevel", hintLevel);

    const { ok, json } = await callOpenAI(SYSTEM_PROMPT, userMsg, model, apiKey);

    if (!ok) {
      // Try to extract message text from response if available
      const fallback = (json && json.error && json.error.message) ? json.error.message : "OpenAI error";
      if (process.env.NODE_ENV === "development") console.debug("OpenAI returned error", json);
      // Return friendly fallback hint
      const fallbackHint = `Could not generate AI hint (${fallback}). Try isolating key variables or re-reading the question.`;
      return NextResponse.json({ hint: fallbackHint, hintLevel, model }, { status: 502 });
    }

    // Extract assistant content
    try {
      const choices = json.choices;
      const assistant = choices && choices[0] && choices[0].message && choices[0].message.content;
      if (!assistant || typeof assistant !== "string") throw new Error("no assistant content");

      // The SYSTEM prompt demands JSON-only output {"hint": string}
      // Try to parse assistant content as JSON
      let parsed: any = null;
      try {
        parsed = JSON.parse(assistant);
      } catch (e) {
        // If model returned non-JSON, attempt to extract a JSON-ish substring
        const m = assistant.match(/\{[\s\S]*\}/);
        if (m) {
          parsed = JSON.parse(m[0]);
        }
      }

      const hintText = parsed && parsed.hint ? String(parsed.hint).trim() : String(assistant).trim();

      // Cache server-side if questionId provided
      if (qid) {
        const key = cacheKey(qid, hintLevel);
        hintCache.set(key, { hint: hintText, expiresAt: Date.now() + CACHE_TTL_MS });
      }

      return NextResponse.json({ hint: hintText, hintLevel, model });
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.debug("Failed to parse OpenAI response", err);
      const fallbackHint = "The AI returned an unexpected response. Try again or request a more specific hint.";
      return NextResponse.json({ hint: fallbackHint, hintLevel, model }, { status: 502 });
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("/api/hint error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
