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
  const [isGuess, setIsGuess] = useState(false)
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
    setIsGuess(false)

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
        setCurrentQuestion(data.question)
        setIsGuess(true)
      } else if (newHistory.length >= maxQuestions[difficulty]) {
        setGameState("lost")
        const newStats = {
          gamesPlayed: stats.gamesPlayed + 1,
          gamesWon: stats.gamesWon,
          averageQuestions: (stats.averageQuestions * stats.gamesPlayed + newHistory.length) / (stats.gamesPlayed + 1),
        }
        saveStats(newStats)
      } else {
        if (typeof data.question !== "string" || data.question.trim() === "") {
          throw new Error("Invalid question received from API.")
        }
        setCurrentQuestion(data.question)
        setIsGuess(false)
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

  const handleGuess = (userSaidYes: boolean) => {
    if (userSaidYes) {
      setGameState("won")
      const newStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        gamesWon: stats.gamesWon + 1,
        averageQuestions: (stats.averageQuestions * stats.gamesPlayed + questionHistory.length) / (stats.gamesPlayed + 1),
      }
      saveStats(newStats)
    } else {
      setIsGuess(false)
      answerQuestion("no")
    }
  }

  const undoLastAnswer = async () => {
    if (questionHistory.length === 0) return

    const newHistory = questionHistory.slice(0, -1)
    setQuestionHistory(newHistory)
    setIsGuess(false)
    setError(null)
    setIsLoading(true)

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
      if (typeof data.question !== "string" || data.question.trim() === "") {
        throw new Error("Invalid question received from API.")
      }
      setCurrentQuestion(data.question)
      setIsGuess(data.isGuess)
    } catch (error: any) {
      console.error("[v0] Error undoing answer:", error)
      setError("I got a bit confused trying to go back. Please try again.")
      setQuestionHistory(questionHistory)
    } finally {
      setIsLoading(false)
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
          isGuess={isGuess}
          onAnswer={answerQuestion}
          onGuess={handleGuess}
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
