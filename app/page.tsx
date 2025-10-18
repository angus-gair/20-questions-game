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

      const data = await response.json()
      setCurrentQuestion(data.question)
    } catch (error) {
      console.error("[v0] Error fetching first question:", error)
      setCurrentQuestion("Is it something tangible or physical?")
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

      const data = await response.json()

      if (data.isGuess && data.isCorrect) {
        // AI guessed correctly
        setGameState("won")
        const newStats = {
          gamesPlayed: stats.gamesPlayed + 1,
          gamesWon: stats.gamesWon + 1,
          averageQuestions: (stats.averageQuestions * stats.gamesPlayed + newHistory.length) / (stats.gamesPlayed + 1),
        }
        saveStats(newStats)
      } else if (newHistory.length >= maxQuestions[difficulty]) {
        // Out of questions
        setGameState("lost")
        const newStats = {
          gamesPlayed: stats.gamesPlayed + 1,
          gamesWon: stats.gamesWon,
          averageQuestions: (stats.averageQuestions * stats.gamesPlayed + newHistory.length) / (stats.gamesPlayed + 1),
        }
        saveStats(newStats)
      } else {
        setCurrentQuestion(data.question)
      }
    } catch (error) {
      console.error("[v0] Error fetching next question:", error)
      setCurrentQuestion("Let me think... Is it commonly found indoors?")
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
