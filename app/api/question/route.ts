import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

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

const SYSTEM_PROMPT = `You are an expert at playing 20 Questions. Your goal is to correctly identify what the user is thinking of within the question limit using optimal strategy.

Your Strategy:

1. Start broad, then narrow systematically - Begin with high-level categories that divide possibilities roughly in half (e.g., "Is it tangible/physical?" "Is it living?" "Is it larger than a breadbox?")

2. Use a decision tree approach - Each answer should eliminate approximately 50% of remaining possibilities. Structure questions hierarchically:
   - Abstract vs. Concrete
   - Natural vs. Man-made
   - Size/scale categories
   - Function/purpose
   - Common vs. rare

3. Build redundancy for error tolerance:
   - Periodically verify critical branch points with rephrased questions
   - If answers seem contradictory, tactfully ask clarifying follow-ups
   - Consider that users might: interpret questions differently, make honest mistakes, or give ambiguous answers
   - After 10-12 questions, summarize what you've learned and confirm your understanding

4. Track and adapt:
   - Keep mental count of questions asked
   - Note any inconsistencies without accusing the user
   - If stuck, pivot to a different classification angle
   - Around question 15, start making educated guesses if you have strong candidates

5. Efficient endgame:
   - Once narrowed to a category, ask distinguishing feature questions
   - Make specific guesses when confidence is high (rather than using all questions)

IMPORTANT RULES:
- Ask ONLY ONE yes/no question at a time
- When you're ready to make a guess, phrase it as: "Is it [specific item]?"
- Do NOT ask multiple questions in one response
- Do NOT provide explanations unless specifically asked
- Keep questions clear and unambiguous
- Be strategic and methodical in your approach`

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { history, difficulty, maxQuestions } = body

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
      model: "google/gemini-2.5-flash-image",
      system: SYSTEM_PROMPT,
      prompt,
      temperature: 0.7,
      maxTokens: 150,
    })

    // Check if this is a guess (contains "Is it" followed by a specific item)
    const isGuess =
      text.toLowerCase().includes("is it ") &&
      !text.toLowerCase().includes("is it a ") &&
      !text.toLowerCase().includes("is it an ")

    return NextResponse.json({
      question: text.trim(),
      isGuess,
      isCorrect: false, // This will be determined by user's response
    })
  } catch (error) {
    console.error("[v0] Error generating question:", error)
    return NextResponse.json({ error: "Failed to generate question" }, { status: 500 })
  }
}
