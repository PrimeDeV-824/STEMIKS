"use client";
/**
 * Client hook to fetch AI hints from /api/hint.
 * - Caches results in sessionStorage and in-memory map
 * - Debounces and prevents concurrent requests for same key
 */

import { useCallback, useRef, useState } from "react";

type HintRequest = {
  questionId?: string;
  text: string;
  choices?: string[];
  resetLevel?: boolean;
};

type HintResult = { hint: string; hintLevel: number; model?: string } | null;

const inMemoryCache = new Map<string, HintResult>();
const inFlight = new Map<string, Promise<HintResult>>();

function storageKey(questionId: string, level: number) {
  return `hintCache:${questionId}:${level}`;
}

function readSessionCache(questionId?: string, level?: number): HintResult {
  if (!questionId || typeof level !== "number") return null;
  const key = storageKey(questionId, level);
  try {
    const s = sessionStorage.getItem(key);
    if (!s) return null;
    return JSON.parse(s) as HintResult;
  } catch (e) {
    return null;
  }
}

function writeSessionCache(questionId: string, level: number, value: HintResult) {
  try {
    sessionStorage.setItem(storageKey(questionId, level), JSON.stringify(value));
  } catch (e) {
    // ignore
  }
}

export function useAiHint() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<HintResult>(null);
  const levelRef = useRef<Record<string, number>>({});

  const getHint = useCallback(async (req: HintRequest) => {
    setError(null);
    setLoading(true);
    try {
      const qid = req.questionId;
      const keyBase = qid || req.text;

      // compute next hintLevel
      const prev = qid ? levelRef.current[qid] || 0 : 0;
      const nextLevel = req.resetLevel ? 1 : Math.min(3, prev + 1);
      if (qid) levelRef.current[qid] = nextLevel;

      const cacheKey = qid ? `${qid}::${nextLevel}` : `${keyBase}::${nextLevel}`;

      // Check in-memory cache
      if (inMemoryCache.has(cacheKey)) {
        const v = inMemoryCache.get(cacheKey) as HintResult;
        setHint(v);
        setLoading(false);
        return v;
      }

      // Check sessionStorage
      const sess = readSessionCache(qid, nextLevel);
      if (sess) {
        inMemoryCache.set(cacheKey, sess);
        setHint(sess);
        setLoading(false);
        return sess;
      }

      // Prevent concurrent identical requests
      if (inFlight.has(cacheKey)) {
        const p = inFlight.get(cacheKey)!;
        const result = await p;
        setHint(result);
        setLoading(false);
        return result;
      }

      // Debounce small interval to avoid accidental double-clicks
      await new Promise((r) => setTimeout(r, 250));

      const payload = {
        questionId: req.questionId,
        text: req.text,
        choices: req.choices,
        hintLevel: nextLevel,
      };

      const promise = (async () => {
        const res = await fetch('/api/hint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const msg = body && (body.error || body.hint) ? (body.error || body.hint) : `HTTP ${res.status}`;
          throw new Error(String(msg));
        }

        const json = await res.json();
        const out: HintResult = { hint: json.hint, hintLevel: json.hintLevel };
        // store caches
        inMemoryCache.set(cacheKey, out);
        if (req.questionId) writeSessionCache(req.questionId, nextLevel, out);
        return out;
      })();

      inFlight.set(cacheKey, promise);
      try {
        const result = await promise;
        setHint(result);
        return result;
      } finally {
        inFlight.delete(cacheKey);
      }
    } catch (err: any) {
      setError(err?.message || 'Hint fetch failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback((questionId?: string) => {
    if (!questionId) {
      inMemoryCache.clear();
      try {
        Object.keys(sessionStorage).forEach((k) => {
          if (k.startsWith('hintCache:')) sessionStorage.removeItem(k);
        });
      } catch (e) {}
      return;
    }
    // clear per-question
    for (let lvl = 1; lvl <= 3; lvl++) {
      const key = `${questionId}::${lvl}`;
      inMemoryCache.delete(key);
      try {
        sessionStorage.removeItem(storageKey(questionId, lvl));
      } catch (e) {}
    }
    delete levelRef.current[questionId];
  }, []);

  return { getHint, loading, error, hint, clearCache } as const;
}
