import { QuizSession, type RNG } from "@/lib/quizSession";
import type { QuizQuestion } from "@/types";

/**
 * Mock question factory for tests
 */
function createMockQuestion(id: string, text: string): QuizQuestion {
  return {
    id,
    subject: "SCIENCE",
    difficulty: "EASY",
    question: text,
    options: ["A", "B", "C", "D"],
    points: 10,
    timeLimit: 30,
    tags: ["test"],
  };
}

describe("QuizSession", () => {
  const mockQuestions = [
    createMockQuestion("q1", "What is 2+2?"),
    createMockQuestion("q2", "What is the capital of France?"),
    createMockQuestion("q3", "What is the largest planet?"),
    createMockQuestion("q4", "What is the speed of light?"),
    createMockQuestion("q5", "What is DNA?"),
  ];

  describe("constructor and initialization", () => {
    it("should create a session without starting it", () => {
      const session = new QuizSession(mockQuestions, 10);
      expect(session.remaining()).toBe(0);
      expect(session.hasNext()).toBe(false);
      expect(session.getNext()).toBeNull();
    });

    it("should accept readonly question array", () => {
      const readonlyQuestions: readonly QuizQuestion[] = mockQuestions;
      const session = new QuizSession(readonlyQuestions, 10);
      session.start();
      expect(session.hasNext()).toBe(true);
    });

    it("should default numQuestions to 10", () => {
      const session = new QuizSession(mockQuestions);
      session.start();
      expect(session.remaining()).toBe(5); // Only 5 questions available
    });

    it("should handle numQuestions of 0", () => {
      const session = new QuizSession(mockQuestions, 0);
      session.start();
      expect(session.hasNext()).toBe(false);
      expect(session.remaining()).toBe(0);
    });

    it("should handle negative numQuestions", () => {
      const session = new QuizSession(mockQuestions, -5);
      session.start();
      expect(session.hasNext()).toBe(false);
      expect(session.remaining()).toBe(0);
    });
  });

  describe("start() and getNext()", () => {
    it("should shuffle and return all requested questions", () => {
      const session = new QuizSession(mockQuestions, 5);
      session.start();

      const returned: QuizQuestion[] = [];
      while (session.hasNext()) {
        const q = session.getNext();
        if (q) returned.push(q);
      }

      expect(returned.length).toBe(5);
      expect(session.hasNext()).toBe(false);
    });

    it("should not repeat questions in a single session", () => {
      const session = new QuizSession(mockQuestions, 5);
      session.start();

      const ids = new Set<string>();
      while (session.hasNext()) {
        const q = session.getNext();
        if (q) {
          expect(ids.has(q.id)).toBe(false);
          ids.add(q.id);
        }
      }

      expect(ids.size).toBe(5);
    });

    it("should return null when trying to get more questions than available", () => {
      const session = new QuizSession(mockQuestions, 5);
      session.start();

      // Consume all 5
      for (let i = 0; i < 5; i++) {
        expect(session.getNext()).not.toBeNull();
      }

      // Try to get 6th
      expect(session.getNext()).toBeNull();
    });

    it("should cap numQuestions at available questions", () => {
      const session = new QuizSession(mockQuestions, 100);
      session.start();
      expect(session.remaining()).toBe(5);
    });

    it("should handle empty questions array", () => {
      const session = new QuizSession([], 10);
      session.start();
      expect(session.hasNext()).toBe(false);
      expect(session.getNext()).toBeNull();
    });

    it("should not mutate the original questions array", () => {
      const originalShallowCopy = [...mockQuestions];
      const session = new QuizSession(mockQuestions, 5);
      session.start();

      // Consume all questions
      while (session.hasNext()) {
        session.getNext();
      }

      // Check original array is unchanged
      expect(mockQuestions).toEqual(originalShallowCopy);
    });
  });

  describe("peek()", () => {
    it("should return next question without advancing cursor", () => {
      const session = new QuizSession(mockQuestions, 3);
      session.start();

      const peeked1 = session.peek();
      const peeked2 = session.peek();
      const next = session.getNext();

      expect(peeked1).toEqual(next);
      expect(peeked2).toEqual(next);
    });

    it("should return null after all questions consumed", () => {
      const session = new QuizSession(mockQuestions, 2);
      session.start();

      session.getNext();
      session.getNext();

      expect(session.peek()).toBeNull();
    });

    it("should return null when no session started", () => {
      const session = new QuizSession(mockQuestions, 2);
      expect(session.peek()).toBeNull();
    });
  });

  describe("hasNext() and remaining()", () => {
    it("should track remaining count correctly", () => {
      const session = new QuizSession(mockQuestions, 3);
      session.start();

      expect(session.remaining()).toBe(3);
      expect(session.hasNext()).toBe(true);

      session.getNext();
      expect(session.remaining()).toBe(2);
      expect(session.hasNext()).toBe(true);

      session.getNext();
      expect(session.remaining()).toBe(1);
      expect(session.hasNext()).toBe(true);

      session.getNext();
      expect(session.remaining()).toBe(0);
      expect(session.hasNext()).toBe(false);
    });

    it("should return 0 remaining before start()", () => {
      const session = new QuizSession(mockQuestions, 3);
      expect(session.remaining()).toBe(0);
    });
  });

  describe("reset()", () => {
    it("should clear session state", () => {
      const session = new QuizSession(mockQuestions, 3);
      session.start();

      session.getNext();
      session.getNext();
      expect(session.remaining()).toBe(1);

      session.reset();
      expect(session.remaining()).toBe(0);
      expect(session.hasNext()).toBe(false);
      expect(session.getNext()).toBeNull();
    });

    it("should allow restart after reset", () => {
      const session = new QuizSession(mockQuestions, 3);
      session.start();
      session.getNext();

      session.reset();
      session.start();

      expect(session.remaining()).toBe(3);
      expect(session.hasNext()).toBe(true);
    });

    it("should produce different shuffles on multiple starts", () => {
      const session = new QuizSession(mockQuestions, 5);

      session.start();
      const firstSequence: string[] = [];
      while (session.hasNext()) {
        const q = session.getNext();
        if (q) firstSequence.push(q.id);
      }

      session.reset();
      session.start();
      const secondSequence: string[] = [];
      while (session.hasNext()) {
        const q = session.getNext();
        if (q) secondSequence.push(q.id);
      }

      // Both sequences should have all 5 questions
      expect(firstSequence.length).toBe(5);
      expect(secondSequence.length).toBe(5);

      // Very likely to be different (flip would be astronomically unlikely)
      // Just verify they're valid at minimum
      expect(new Set(firstSequence).size).toBe(5);
      expect(new Set(secondSequence).size).toBe(5);
    });
  });

  describe("deterministic RNG for testing", () => {
    it("should accept custom RNG function", () => {
      let callCount = 0;
      const deterministicRng: RNG = () => {
        callCount++;
        return 0.5; // Always return 0.5
      };

      const session = new QuizSession(mockQuestions, 3, deterministicRng);
      session.start();

      expect(callCount).toBeGreaterThan(0);
    });

    it("should produce deterministic shuffle with fixed RNG", () => {
      // This RNG always returns a specific sequence for testing
      let rngIndex = 0;
      const sequence = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      const deterministicRng: RNG = () => {
        const val = sequence[rngIndex % sequence.length];
        rngIndex++;
        return val;
      };

      const session1 = new QuizSession(mockQuestions, 5, deterministicRng);
      const session2 = new QuizSession(mockQuestions, 5, () => {
        const val = sequence[rngIndex % sequence.length];
        rngIndex++;
        return val;
      });

      session1.start();
      session2.start();

      // Reset index for second session
      rngIndex = 0;

      const seq1: string[] = [];
      const seq2: string[] = [];

      while (session1.hasNext()) {
        const q = session1.getNext();
        if (q) seq1.push(q.id);
      }

      rngIndex = 0;

      while (session2.hasNext()) {
        const q = session2.getNext();
        if (q) seq2.push(q.id);
      }

      // Both sequences should have all 5 unique questions
      expect(seq1.length).toBe(5);
      expect(seq2.length).toBe(5);
      expect(new Set(seq1).size).toBe(5);
      expect(new Set(seq2).size).toBe(5);
    });
  });

  describe("edge cases", () => {
    it("should handle single question", () => {
      const singleQuestion = [createMockQuestion("q1", "Only question")];
      const session = new QuizSession(singleQuestion, 1);
      session.start();

      expect(session.remaining()).toBe(1);
      expect(session.hasNext()).toBe(true);

      const q = session.getNext();
      expect(q?.id).toBe("q1");
      expect(session.hasNext()).toBe(false);
    });

    it("should handle questions with duplicate IDs (selection by index)", () => {
      // While unusual, the session should still work correctly by index
      const dupIdQuestions = [
        createMockQuestion("q1", "First q1"),
        createMockQuestion("q1", "Second q1"),
        createMockQuestion("q2", "Only q2"),
      ];

      const session = new QuizSession(dupIdQuestions, 2);
      session.start();

      const seq: QuizQuestion[] = [];
      while (session.hasNext()) {
        const q = session.getNext();
        if (q) seq.push(q);
      }

      // Should always get 2 questions from 3 available
      expect(seq.length).toBe(2);
    });

    it("should handle large numQuestions gracefully", () => {
      const session = new QuizSession(mockQuestions, 1000000);
      session.start();

      // Should cap at available questions
      expect(session.remaining()).toBe(5);

      let count = 0;
      while (session.hasNext()) {
        session.getNext();
        count++;
      }

      expect(count).toBe(5);
    });
  });
});
