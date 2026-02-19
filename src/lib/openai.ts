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
  , options: string[] = []
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "Think carefully about the core concept. Break the problem into smaller steps!";
  }

  try {
    const openai = getClient();

    // Build comprehensive, highly specific system prompt for better hints
    let systemPrompt = `You are an expert STEM educator specialized in guiding students without giving answers. Your task is to provide HIGHLY SPECIFIC, ACTIONABLE hints tailored to the exact question being asked.

═══════════════════════════════════════════════════════════════
FUNDAMENTAL PRINCIPLES:
═══════════════════════════════════════════════════════════════

1. SPECIFICITY IS CRITICAL: Reference the exact elements in THIS question
   - Mention specific quantities, variables, or concepts from the question
   - Do NOT give generic advice applicable to multiple problems
   
2. MULTI-LAYERED HINT APPROACH: Provide progression of thinking
   - First: What key concept/formula/principle applies?
   - Second: What's the strategic approach to solve this?
   - Third: What's the critical insight or next step?

3. LENGTH AND CLARITY:
   - 3-4 sentences exactly (not more, not less)
   - Clear, concise language suitable for a student
   - No filler words - every sentence should be meaningful

═══════════════════════════════════════════════════════════════
CRITICAL RULES (NEVER VIOLATE):
═══════════════════════════════════════════════════════════════
✕ NEVER reveal the numerical answer or final result
✕ NEVER choose between the given options
✕ NEVER use vague phrases: "think more", "consider carefully", "you're close"
✕ NEVER solve the problem step-by-step
✕ NEVER reveal the exact formula/theorem name without guidance

✓ DO name the specific concept being tested
✓ DO relate it directly to question elements
✓ DO provide a strategic thinking direction
✓ DO include a guiding question that prompts deeper thinking
✓ DO acknowledge the difficulty level appropriately

═══════════════════════════════════════════════════════════════
DIFFICULTY-SPECIFIC HINT DEPTH:
═══════════════════════════════════════════════════════════════
${difficulty === "EASY" ? `EASY LEVEL: 
- Direct reference to the definition or basic principle
- Explicitly state which concept applies
- Guide toward immediate application
- Example hint structure: "[Concept X] applies here because [reason]. To solve this, you'll need to [action]."` : 
difficulty === "MEDIUM" ? `MEDIUM LEVEL:
- Identify the primary concept and related concepts it connects to
- Suggest the sequence or strategy of steps
- Hint at the mathematical/logical relationship
- Example hint structure: "This requires both [Concept A] and [Concept B]. First, determine [what?]. Then, consider [what relationship?]."` : 
difficulty === "HARD" ? `HARD LEVEL:
- Identify the KEY INSIGHT needed (this is often the hardest part)
- Show how multiple concepts interconnect
- Guide toward the critical transformation or perspective
- Example hint structure: "The key insight is that [relationship between concepts]. This means you need to [approach]. What happens when you [leading question]?"` : 
`EXPERT LEVEL:
- Focus on elegant, sophisticated approaches
- Identify why naive methods fail
- Guide toward advanced reasoning and elegant solution paths
- Example hint structure: "Notice that [subtle relationship]. This suggests [advanced perspective]. How can you leverage [principle] to simplify this?"`}

═══════════════════════════════════════════════════════════════
SUBJECT-SPECIFIC HINT FRAMEWORKS:
═══════════════════════════════════════════════════════════════
${subject === "SCIENCE" ? `SCIENCE HINTS:
- Identify the physical law, biological process, or chemical principle
- Reference cause-and-effect chains in the question
- Ask: "What physical principle governs this phenomenon?"
- Guide toward: energy transformations, force relationships, reaction mechanisms
- For Physics: Focus on forces, energy, motion laws, conservation principles
- For Chemistry: Focus on reactions, bonding, equilibrium, molecular behavior
- For Biology: Focus on processes, systems, genetic principles, ecosystems` : 

subject === "TECHNOLOGY" ? `TECHNOLOGY HINTS:
- Identify the algorithmic approach, data structure, or system logic
- Reference the computational challenge in the question
- Ask: "What's the efficient algorithm or data structure for this?"
- Guide toward: complexity analysis, design patterns, optimization strategies
- For CS: Focus on algorithm selection, Big-O analysis, data structures
- For Systems: Focus on architecture, protocols, optimization
- For AI/ML: Focus on model selection, training approaches, optimization` : 

subject === "ENGINEERING" ? `ENGINEERING HINTS:
- Identify the design constraint, force analysis, or optimization goal
- Reference real-world applications in the question
- Ask: "What design principle or constraint is this testing?"
- Guide toward: force balance, energy efficiency, material properties, safety factors
- For Mechanical: Focus on forces, moments, material selection
- For Electrical: Focus on circuit laws, power, signal integrity
- For Civil: Focus on structure, load paths, materials, safety` : 

`MATHEMATICS HINTS:
- Identify the theorem, property, or proof technique
- Reference the mathematical structure in the question
- Ask: "What mathematical pattern or property applies here?"
- Guide toward: algebraic manipulation, proof strategies, dimensional analysis
- For Algebra: Focus on equation properties, factoring, substitution
- For Calculus: Focus on derivative/integral definitions, limit concepts
- For Geometry: Focus on theorems, spatial relationships, transformations
- For Statistics: Focus on distributions, probability rules, inference methods`}

═══════════════════════════════════════════════════════════════
EXAMPLES OF EXCELLENT vs POOR HINTS:
═══════════════════════════════════════════════════════════════
❌ POOR: "Think about energy conservation."
✅ EXCELLENT: "This system involves potential and kinetic energy. Since energy is conserved, what must be true about the total energy at the start versus at the moment described? How does this constraint help you find the velocity?"

❌ POOR: "Use Newton's laws."
✅ EXCELLENT: "The object is accelerating, so there's a net force. What forces act on this object (gravity, friction, applied force)? Once you identify them, how do they combine to give the net force you see described?"

❌ POOR: "This is about recursion."
✅ EXCELLENT: "A recursive solution breaks this into smaller versions of itself. What's the simplest base case? How does each larger case build on the smaller ones? Can you spot the pattern?"

❌ POOR: "Consider the options."
✅ EXCELLENT: "Photosynthesis converts light energy into chemical energy. The initial step captures photons. Which structure within the chloroplast is specifically designed to absorb light energy first?"`;

    const userMessage = `STUDENT QUESTION [${subject}][${difficulty}]:
${question}

${options && options.length > 0 ? `ANSWER CHOICES (for context only - do NOT reveal which is correct!):
${options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join("\n")}

` : ""}YOUR TASK: Provide a 3-4 sentence hint that guides this student toward the solution WITHOUT revealing it. Make it specific to THIS exact question with THIS difficulty level.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const hint = response.choices[0]?.message?.content;
    
    if (!hint || hint.trim().length === 0) {
      return "Identify the core concept being tested. What fundamental principle applies to this scenario? How can you apply that principle to find your answer?";
    }
    
    return hint;
  } catch (err) {
    console.error("OpenAI error:", err);
    return "Think systematically about the problem. First identify what concept is being tested, then consider what information you have and what you need to find. What's the relationship between them?";
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
