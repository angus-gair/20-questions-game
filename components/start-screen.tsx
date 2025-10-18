"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Sparkles, Trophy } from "lucide-react"
import type { Difficulty } from "@/app/page"
import type { GameStats } from "@/lib/game-stats"

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void
  stats: GameStats
}

export function StartScreen({ onStart, stats }: StartScreenProps) {
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0

  return (
    <div className="container mx-auto px-4 py-6 sm:py-12 flex items-center justify-center min-h-screen">
      <div className="max-w-2xl w-full space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 mb-2 sm:mb-4 animate-in zoom-in duration-500 hover:scale-110 transition-transform">
            <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">20 Questions</h1>
          <p className="text-lg sm:text-xl text-muted-foreground text-balance">Think of anything. I'll guess it.</p>
        </div>

        <Card className="border-2 hover:border-primary/30 transition-colors duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              How to Play
            </CardTitle>
            <CardDescription>Let Gemini AI showcase its deductive reasoning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-3 text-sm sm:text-base">
              <li
                className="flex gap-3 animate-in slide-in-from-left-2 duration-500"
                style={{ animationDelay: "100ms" }}
              >
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs sm:text-sm font-bold shadow-lg">
                  1
                </span>
                <span className="text-foreground leading-relaxed">
                  Think of any person, place, or thing (but don't tell me!)
                </span>
              </li>
              <li
                className="flex gap-3 animate-in slide-in-from-left-2 duration-500"
                style={{ animationDelay: "200ms" }}
              >
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs sm:text-sm font-bold shadow-lg">
                  2
                </span>
                <span className="text-foreground leading-relaxed">Answer my yes/no questions honestly</span>
              </li>
              <li
                className="flex gap-3 animate-in slide-in-from-left-2 duration-500"
                style={{ animationDelay: "300ms" }}
              >
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs sm:text-sm font-bold shadow-lg">
                  3
                </span>
                <span className="text-foreground leading-relaxed">
                  I'll try to guess what you're thinking within the question limit
                </span>
              </li>
            </ol>

            <div className="pt-4 border-t space-y-3">
              <p className="text-sm font-medium">Choose your difficulty:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  onClick={() => onStart("easy")}
                  variant="outline"
                  className="h-auto py-4 sm:py-5 flex flex-col gap-2 hover:border-chart-1 hover:bg-chart-1/10 hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation"
                >
                  <span className="font-semibold text-base">Easy</span>
                  <span className="text-xs text-muted-foreground">25 questions</span>
                </Button>
                <Button
                  onClick={() => onStart("normal")}
                  className="h-auto py-4 sm:py-5 flex flex-col gap-2 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation"
                >
                  <span className="font-semibold text-base">Normal</span>
                  <span className="text-xs opacity-90">20 questions</span>
                </Button>
                <Button
                  onClick={() => onStart("hard")}
                  variant="outline"
                  className="h-auto py-4 sm:py-5 flex flex-col gap-2 hover:border-destructive hover:bg-destructive/10 hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation"
                >
                  <span className="font-semibold text-base">Hard</span>
                  <span className="text-xs text-muted-foreground">15 questions</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {stats.gamesPlayed > 0 && (
          <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors duration-300 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Your Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                <div className="animate-in zoom-in duration-500" style={{ animationDelay: "400ms" }}>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{stats.gamesPlayed}</div>
                  <div className="text-xs text-muted-foreground">Games Played</div>
                </div>
                <div className="animate-in zoom-in duration-500" style={{ animationDelay: "500ms" }}>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{winRate}%</div>
                  <div className="text-xs text-muted-foreground">AI Win Rate</div>
                </div>
                <div className="animate-in zoom-in duration-500" style={{ animationDelay: "600ms" }}>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{stats.averageQuestions.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Avg Questions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
