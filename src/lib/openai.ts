import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export async function generateHint(
  question: string,
  subject: string,
  difficulty: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "Think carefully about the core concept. Break the problem into smaller steps!";
  }

  try {
    const openai = getClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful STEM tutor. Give a SHORT hint (1-2 sentences max) 
            that guides toward the answer without giving it away. Be encouraging.
            Subject: ${subject}, Difficulty: ${difficulty}`,
        },
        {
          role: "user",
          content: `Hint for: ${question}`,
        },
      ],
      max_tokens: 80,
      temperature: 0.7,
    });
    return (
      response.choices[0]?.message?.content ??
      "Think carefully about the core concept!"
    );
  } catch (err) {
    console.error("OpenAI error:", err);
    return "Think carefully about the core concept. Review your fundamentals!";
  }
}

export async function generateExplanation(
  question: string,
  correctAnswer: string,
  userAnswer: string,
  subject: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return `The correct answer is "${correctAnswer}". Review this topic to understand why!`;
  }

  try {
    const openai = getClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a STEM educator. Explain why the correct answer is right 
            concisely (2-3 sentences). Be encouraging and educational.`,
        },
        {
          role: "user",
          content: `Question: ${question}
Correct: ${correctAnswer}
Student answered: ${userAnswer}
Subject: ${subject}`,
        },
      ],
      max_tokens: 120,
      temperature: 0.5,
    });
    return (
      response.choices[0]?.message?.content ??
      "Great effort! Review the concept and try again."
    );
  } catch {
    return `The correct answer is "${correctAnswer}". Keep practicing!`;
  }
}
