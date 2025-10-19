import { type NextRequest, NextResponse } from "next/server"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const OPENAI_API_KEY = process.env.OPENAI_API_KEY // OpenRouter API key

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
- **GUESS EARLY AND OFTEN:** As soon as you narrow down to a specific category or item, MAKE A GUESS!
  - If you know it's a specific type of fruit -> GUESS which fruit
  - If you know it's a specific vehicle -> GUESS which vehicle
  - If you know it's a specific animal -> GUESS which animal
  - DO NOT keep asking about details once you've narrowed it down to a single item!

**Output Rules:**
- Ask ONLY ONE yes/no question at a time.
- **CRITICAL:** When you think you know what it is, you MUST prepend your response with the keyword "GUESS:".
- **IMPORTANT:** Start guessing as early as question 5-7 if you have a strong candidate!
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

${history.length >= 5 ? "IMPORTANT: You've asked " + history.length + " questions. If you've narrowed it down to a specific item or category, make a GUESS now! Don't waste questions on minor details." : ""}

Remember:
- Ask ONLY ONE clear yes/no question.
- If you've identified a specific item (like 'apple', 'truck', 'dog'), make a GUESS immediately by prepending "GUESS:" to your response.
- Don't ask about minor details once you know what it is - just GUESS!`

    // Use OpenRouter API with GPT-5-mini
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured (OpenRouter key required)")
    }

    console.log("[v0] Using OpenRouter API with gpt-5-mini")

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'HTTP-Referer': 'https://20.ajinsights.com.au',
        'X-Title': '20 Questions Game',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 150,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const text = data.choices[0]?.message?.content?.trim() || ''

    if (!text) {
      throw new Error("No response from OpenRouter API")
    }

    console.log("[v0] Generated response:", text)

    let responseText = text.trim()

    // Check if GUESS: appears anywhere in the response (not just at start)
    const isGuess = responseText.includes("GUESS:")

    if (isGuess) {
      // Extract everything after "GUESS:" if it exists
      const guessIndex = responseText.indexOf("GUESS:")
      responseText = responseText.substring(guessIndex + 6).trim()
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
