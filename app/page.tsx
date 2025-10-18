"use client"

import { useState, useEffect } from "react"
import { StartScreen } from "@/components/start-screen"
import { GameScreen } from "@/components/game-screen"
import { EndScreen } from "@/components/end-screen"
import type { GameStats } from "@/lib/game-stats"

export type GameState = "start" | "playing" | "won" | "lost" | "gaveup"
export type Difficulty = "easy" | "normal" | "hard"

export interface QuestionAnswer {
  question: string
  answer: "yes" | "no" | "maybe"
  questionNumber: number
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("start")
  const [difficulty, setDifficulty] = useState<Difficulty>("normal")
  const [questionHistory, setQuestionHistory] = useState<QuestionAnswer[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    averageQuestions: 0,
  })

  const maxQuestions = {
    easy: 25,
    normal: 20,
    hard: 15,
  }

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem("20q-stats")
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }
  }, [])

  const saveStats = (newStats: GameStats) => {
    setStats(newStats)
    localStorage.setItem("20q-stats", JSON.stringify(newStats))
  }

  const startGame = async (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty)
    setGameState("playing")
    setQuestionHistory([])
    setIsLoading(true)
    setError(null)

    // Get first question from AI
    try {
      const response = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: [],
          difficulty: selectedDifficulty,
          maxQuestions: maxQuestions[selectedDifficulty],
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()
      if (typeof data.question !== "string" || data.question.trim() === "") {
        throw new Error("Invalid question received from API.")
      }
      setCurrentQuestion(data.question)
    } catch (error: any) {
      console.error("[v0] Error fetching first question:", error)
      setError("I'm having a little trouble thinking of a question right now. Please try again in a moment.")
      setGameState("start") // Go back to start screen on error
    } finally {
      setIsLoading(false)
    }
  }

  const answerQuestion = async (answer: "yes" | "no" | "maybe") => {
    const newHistory = [
      ...questionHistory,
      {
        question: currentQuestion,
        answer,
        questionNumber: questionHistory.length + 1,
      },
    ]
    setQuestionHistory(newHistory)
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: newHistory,
          difficulty,
          maxQuestions: maxQuestions[difficulty],
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.isGuess) {
        // AI is making a guess
        // For now, we assume the user will tell us if it's correct.
        // In a real scenario, you'd have a UI for "Yes, you got it!" or "No, that's not it."
        // For this simulation, we'll treat a guess like a question and proceed.
        // A more advanced implementation would handle the "isCorrect" logic.
        if (typeof data.question !== "string" || data.question.trim() === "") {
          throw new Error("Invalid guess received from API.")
        }
        setCurrentQuestion(data.question)
      } else if (newHistory.length >= maxQuestions[difficulty]) {
        // User wins if AI hasn't guessed by the last question
        setGameState("lost") // "lost" from the AI's perspective
        const newStats = {
          gamesPlayed: stats.gamesPlayed + 1,
          gamesWon: stats.gamesWon, // User wins, AI loses
          averageQuestions: (stats.averageQuestions * stats.gamesPlayed + newHistory.length) / (stats.gamesPlayed + 1),
        }
        saveStats(newStats)
      } else {
        if (typeof data.question !== "string" || data.question.trim() === "") {
          throw new Error("Invalid question received from API.")
        }
        setCurrentQuestion(data.question)
      }
    } catch (error: any) {
      console.error("[v0] Error fetching next question:", error)
      setError("Oops! I had a brain-freeze. Could you try answering again?")
      // Don't revert the question, allow user to retry the same answer
      setQuestionHistory(questionHistory) // Revert history to pre-error state
    } finally {
      setIsLoading(false)
    }
  }

  const undoLastAnswer = () => {
    if (questionHistory.length > 0) {
      const newHistory = questionHistory.slice(0, -1)
      setQuestionHistory(newHistory)
      // Restore the previous question
      if (newHistory.length > 0) {
        setCurrentQuestion(newHistory[newHistory.length - 1].question)
      }
    }
  }

  const giveUp = () => {
    setGameState("gaveup")
    const newStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      gamesWon: stats.gamesWon,
      averageQuestions: (stats.averageQuestions * stats.gamesPlayed + questionHistory.length) / (stats.gamesPlayed + 1),
    }
    saveStats(newStats)
  }

  const playAgain = () => {
    setGameState("start")
    setQuestionHistory([])
    setCurrentQuestion("")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      {gameState === "start" && <StartScreen onStart={startGame} stats={stats} />}
      {gameState === "playing" && (
        <GameScreen
          currentQuestion={currentQuestion}
          questionHistory={questionHistory}
          maxQuestions={maxQuestions[difficulty]}
          difficulty={difficulty}
          isLoading={isLoading}
          error={error}
          onAnswer={answerQuestion}
          onUndo={undoLastAnswer}
          onGiveUp={giveUp}
        />
      )}
      {(gameState === "won" || gameState === "lost" || gameState === "gaveup") && (
        <EndScreen
          gameState={gameState}
          questionCount={questionHistory.length}
          maxQuestions={maxQuestions[difficulty]}
          stats={stats}
          onPlayAgain={playAgain}
          questionHistory={questionHistory}
        />
      )}
    </main>
  )
}
