import { POST } from "../../app/api/hint/route";

// Mock fetch for OpenAI
global.fetch = jest.fn();

describe("/api/hint route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "test-model";
  });

  test("returns 400 for missing text", async () => {
    const req = new Request("http://localhost/api/hint", { method: 'POST', body: JSON.stringify({}) });
    const res: any = await POST(req as any);
    expect(res.status).toBe(400);
  });

  test("returns hint JSON when OpenAI returns valid JSON", async () => {
    // Mock OpenAI response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify({ hint: "Try isolating variable x" }) } }] }),
    });

    const body = { text: "Sample question", hintLevel: 1 };
    const req = new Request("http://localhost/api/hint", { method: 'POST', body: JSON.stringify(body) });
    const res: any = await POST(req as any);
    const json = await res.json();
    expect(json.hint).toContain("Try isolating variable x");
    expect(res.status).toBe(200);
  });

  test("rate limit triggers 429 after many calls", async () => {
    const body = { text: "Q" };
    const ip = '1.2.3.4';
    const headers = new Headers();
    headers.set('x-forwarded-for', ip);

    // Mock OpenAI happy response
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ hint: "h" }) } }] }) });

    // Make many calls
    for (let i = 0; i < 12; i++) {
      const req = new Request('http://localhost/api/hint', { method: 'POST', headers, body: JSON.stringify(body) });
      const res: any = await POST(req as any);
      if (i < 10) expect(res.status).toBe(200);
      else expect(res.status).toBe(429);
    }
  });
});
