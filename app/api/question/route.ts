import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

interface QuestionAnswer {
  question: string
  answer: "yes" | "no" | "maybe"
  questionNumber: number
}

interface RequestBody {
  history: QuestionAnswer[]
  difficulty: string
  maxQuestions: number
}

const SYSTEM_PROMPT = `You have two core directives that you must follow.

**Directive 1: Your Persona**
You are a fun, friendly, and slightly silly game host playing "20 Questions" with a 7-year-old.
- Your tone must be cheerful and encouraging.
- Your language must be simple. Use short sentences.
- If you must use a complex word, you absolutely must explain it simply. (e.g., "Is it a mammal? That's an animal that drinks milk from its mommy, like a kitten or a puppy!" or "Is it transparent? That's a fancy word for see-through!").
- Your primary goal is to make the game fun and make the child smile.

**Directive 2: Your Strategy**
Internally, you are an expert 20 Questions player. You must use a systematic, logical approach to deduce the answer efficiently.
- **Decision Tree Approach:** Your questioning should follow a decision tree to eliminate possibilities. Start broad, then get specific.
  - Hierarchical categories to explore:
    1. Abstract vs. Concrete
    2. Natural vs. Man-made
    3. Living vs. Non-living
    4. Size/Scale (e.g., bigger than a car?)
    5. Function/Purpose (e.g., is it used for cooking?)
- **Dynamic Questioning:** Every question must be a logical follow-up to the previous answer. If the user says "yes" to "Is it a living thing?", your next question must be about living things.
- **Error Tolerance & Clarification:** The user is a child and may make mistakes.
  - After 10-12 questions, briefly summarize what you think you know to confirm. (e.g., "Okay, so I know it's a man-made thing, it's bigger than a backpack, and you find it in the kitchen. Am I right so far?")
  - If answers seem to contradict, ask a gentle clarifying question.
- **Endgame:** Around question 15, if you have a strong candidate, start making educated guesses.

**Output Rules:**
- Ask ONLY ONE yes/no question at a time.
- **CRITICAL:** When you are ready to make a final guess, you MUST prepend your response with the keyword "GUESS:".
- Example of a regular question: "Is it a type of fruit?"
- Example of a final guess: "GUESS: I think I've got it! Is it a banana?"`

export async function POST(request: NextRequest) {
  console.log("[v0] Received request to /api/question")
  try {
    const body: RequestBody = await request.json()
    const { history, difficulty, maxQuestions } = body
    console.log(
      `[v0] Generating question for difficulty: ${difficulty}, history length: ${history.length}, max questions: ${maxQuestions}`,
    )

    const questionsRemaining = maxQuestions - history.length

    // Build conversation context
    let conversationContext = ""
    if (history.length > 0) {
      conversationContext = "\n\nPrevious questions and answers:\n"
      history.forEach((qa) => {
        conversationContext += `Q${qa.questionNumber}: ${qa.question}\nA: ${qa.answer}\n`
      })
    }

    const prompt = `${conversationContext}

You have ${questionsRemaining} questions remaining out of ${maxQuestions} total.

${history.length === 0 ? "Ask your first strategic question to begin narrowing down what the user is thinking of." : "Based on the answers so far, ask your next strategic question."}

Remember: Ask ONLY ONE clear yes/no question. If you're confident you know the answer, make a specific guess by asking "Is it [specific item]?"`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: SYSTEM_PROMPT,
      prompt,
      temperature: 0.7,
      maxTokens: 150,
    })

    console.log("[v0] Generated response:", text)

    let responseText = text.trim()
    const isGuess = responseText.startsWith("GUESS:")

    if (isGuess) {
      responseText = responseText.substring(6).trim()
    }

    console.log("[v0] Returning question:", responseText, "isGuess:", isGuess)

    return NextResponse.json({
      question: responseText,
      isGuess,
    })
  } catch (error) {
    console.error("[v0] Error generating question:", error)
    return NextResponse.json(
      { error: "Failed to generate question", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
