"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Brain, RotateCcw, Sparkles, PartyPopper } from "lucide-react"
import type { GameState, QuestionAnswer } from "@/app/page"
import type { GameStats } from "@/lib/game-stats"
import { useEffect, useState } from "react"

interface EndScreenProps {
  gameState: GameState
  questionCount: number
  maxQuestions: number
  stats: GameStats
  onPlayAgain: () => void
  questionHistory: QuestionAnswer[]
}

export function EndScreen({
  gameState,
  questionCount,
  maxQuestions,
  stats,
  onPlayAgain,
  questionHistory,
}: EndScreenProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (gameState === "won") {
      setShowConfetti(true)
      const duration = 4000
      const animationEnd = Date.now() + duration
      const colors = ["#7033ff", "#4ac885", "#fd822b", "#3276e4", "#8c5cff"]

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          clearInterval(interval)
          setShowConfetti(false)
          return
        }

        const particleCount = 5

        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement("div")
          particle.className = "confetti-particle"
          particle.style.cssText = `
            position: fixed;
            width: ${randomInRange(8, 12)}px;
            height: ${randomInRange(8, 12)}px;
            background-color: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${randomInRange(0, 100)}%;
            top: -10px;
            opacity: 1;
            transform: rotate(${randomInRange(0, 360)}deg);
            animation: confetti-fall ${randomInRange(2, 4)}s linear forwards;
            pointer-events: none;
            z-index: 9999;
            border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
          `
          document.body.appendChild(particle)

          setTimeout(() => {
            particle.remove()
          }, 4000)
        }
      }, 40)

      return () => clearInterval(interval)
    }
  }, [gameState])

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0

  const getTitle = () => {
    switch (gameState) {
      case "won":
        return "I Got It!"
      case "lost":
        return "You Stumped Me!"
      case "gaveup":
        return "Game Over"
    }
  }

  const getDescription = () => {
    switch (gameState) {
      case "won":
        return `Successfully guessed in ${questionCount} question${questionCount !== 1 ? "s" : ""}!`
      case "lost":
        return `Used all ${maxQuestions} questions without guessing correctly.`
      case "gaveup":
        return "Better luck next time!"
    }
  }

  const getIcon = () => {
    switch (gameState) {
      case "won":
        return <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-bounce" />
      case "lost":
        return <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
      case "gaveup":
        return <PartyPopper className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
    }
  }

  return (
    <>
      <style jsx global>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>

      <div className="container mx-auto px-4 py-6 sm:py-12 flex items-center justify-center min-h-screen">
        <div className="max-w-2xl w-full space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 mb-2 sm:mb-4 animate-in zoom-in duration-500 hover:scale-110 transition-transform">
              {getIcon()}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance animate-in slide-in-from-bottom-2 duration-500">
              {getTitle()}
            </h1>
            <p
              className="text-base sm:text-lg text-muted-foreground text-balance animate-in slide-in-from-bottom-2 duration-500"
              style={{ animationDelay: "100ms" }}
            >
              {getDescription()}
            </p>
          </div>

          <Card
            className="border-2 shadow-lg animate-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: "200ms" }}
          >
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Sparkles className="w-5 h-5 text-primary" />
                Game Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                <div
                  className="p-4 sm:p-5 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200 animate-in zoom-in duration-500"
                  style={{ animationDelay: "300ms" }}
                >
                  <div className="text-3xl sm:text-4xl font-bold text-primary">{questionCount}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">Questions Used</div>
                </div>
                <div
                  className="p-4 sm:p-5 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200 animate-in zoom-in duration-500"
                  style={{ animationDelay: "400ms" }}
                >
                  <div className="text-3xl sm:text-4xl font-bold text-primary">{maxQuestions - questionCount}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">Questions Left</div>
                </div>
              </div>

              {questionHistory.length > 0 && (
                <div className="space-y-3 animate-in fade-in duration-500" style={{ animationDelay: "500ms" }}>
                  <h3 className="font-semibold text-sm">Question History</h3>
                  <ScrollArea className="h-[180px] sm:h-[200px] rounded-lg border p-3 sm:p-4">
                    <div className="space-y-2">
                      {questionHistory.map((qa, index) => (
                        <div key={index} className="flex gap-2 text-xs sm:text-sm items-start">
                          <Badge
                            variant="outline"
                            className="flex-shrink-0 h-5 w-5 p-0 justify-center text-xs font-bold"
                          >
                            {qa.questionNumber}
                          </Badge>
                          <span className="flex-1 leading-relaxed">{qa.question}</span>
                          <Badge variant="secondary" className="flex-shrink-0 capitalize text-xs">
                            {qa.answer}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors duration-300 shadow-md animate-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: "600ms" }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Overall Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                <div className="animate-in zoom-in duration-500" style={{ animationDelay: "700ms" }}>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{stats.gamesPlayed}</div>
                  <div className="text-xs text-muted-foreground mt-1">Games Played</div>
                </div>
                <div className="animate-in zoom-in duration-500" style={{ animationDelay: "800ms" }}>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{winRate}%</div>
                  <div className="text-xs text-muted-foreground mt-1">AI Win Rate</div>
                </div>
                <div className="animate-in zoom-in duration-500" style={{ animationDelay: "900ms" }}>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{stats.averageQuestions.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Avg Questions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={onPlayAgain}
            size="lg"
            className="w-full h-12 sm:h-14 text-base sm:text-lg hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation animate-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: "1000ms" }}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </>
  )
}
