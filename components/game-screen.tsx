"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Undo2, Flag, Loader2 } from "lucide-react"
import type { QuestionAnswer, Difficulty } from "@/app/page"
import { Progress } from "@/components/ui/progress"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { XCircle } from "lucide-react"

interface GameScreenProps {
  currentQuestion: string
  questionHistory: QuestionAnswer[]
  maxQuestions: number
  difficulty: Difficulty
  isLoading: boolean
  error: string | null
  onAnswer: (answer: "yes" | "no" | "maybe") => void
  onUndo: () => void
  onGiveUp: () => void
}

export function GameScreen({
  currentQuestion,
  questionHistory,
  maxQuestions,
  difficulty,
  isLoading,
  error,
  onAnswer,
  onUndo,
  onGiveUp,
}: GameScreenProps) {
  const questionsUsed = questionHistory.length
  const progressPercentage = (questionsUsed / maxQuestions) * 100

  const getProgressColor = () => {
    if (progressPercentage < 50) return "bg-chart-1"
    if (progressPercentage < 80) return "bg-primary"
    return "bg-destructive"
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-5xl">
      <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 animate-pulse">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">20 Questions</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <span className="capitalize font-medium">{difficulty}</span> mode
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-base sm:text-lg px-3 sm:px-4 py-2 font-bold">
            {questionsUsed} / {maxQuestions}
          </Badge>
        </div>

        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2.5 sm:h-3 transition-all duration-500" />
          <p className="text-xs sm:text-sm text-muted-foreground text-center font-medium">
            {maxQuestions - questionsUsed} questions remaining
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {error && (
            <Alert variant="destructive" className="lg:col-span-2 animate-in fade-in zoom-in-95 duration-300">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="border-2 border-primary/20 lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Current Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="min-h-[100px] sm:min-h-[80px] flex items-center justify-center px-2">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground animate-in fade-in zoom-in duration-300">
                    <Loader2 className="w-8 h-8 sm:w-6 sm:h-6 animate-spin" />
                    <span className="text-sm sm:text-base animate-pulse">Thinking deeply...</span>
                  </div>
                ) : (
                  <p className="text-lg sm:text-xl text-center text-balance font-medium leading-relaxed animate-in fade-in slide-in-from-top-2 duration-500">
                    {currentQuestion}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => onAnswer("yes")}
                  disabled={isLoading}
                  size="lg"
                  className="w-full sm:w-auto sm:min-w-[140px] h-12 sm:h-11 text-base hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg touch-manipulation"
                >
                  Yes
                </Button>
                <Button
                  onClick={() => onAnswer("no")}
                  disabled={isLoading}
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto sm:min-w-[140px] h-12 sm:h-11 text-base hover:scale-105 active:scale-95 transition-all duration-200 hover:border-primary hover:bg-primary/5 touch-manipulation"
                >
                  No
                </Button>
                <Button
                  onClick={() => onAnswer("maybe")}
                  disabled={isLoading}
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto sm:min-w-[140px] h-12 sm:h-11 text-base hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation"
                >
                  Maybe / Unsure
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-4 border-t">
                <Button
                  onClick={onUndo}
                  disabled={isLoading || questionHistory.length === 0}
                  variant="ghost"
                  size="sm"
                  className="w-full sm:w-auto h-10 hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation"
                >
                  <Undo2 className="w-4 h-4 mr-2" />
                  Undo Last Answer
                </Button>
                <Button
                  onClick={onGiveUp}
                  disabled={isLoading}
                  variant="ghost"
                  size="sm"
                  className="w-full sm:w-auto h-10 text-destructive hover:text-destructive hover:bg-destructive/10 hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Give Up
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-md">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Question History</CardTitle>
            </CardHeader>
            <CardContent>
              {questionHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm sm:text-base animate-pulse">
                  No questions asked yet. Let's begin!
                </p>
              ) : (
                <ScrollArea className="h-[250px] sm:h-[300px] pr-2 sm:pr-4">
                  <div className="space-y-2 sm:space-y-3">
                    {questionHistory.map((qa, index) => (
                      <div
                        key={index}
                        className="flex gap-2 sm:gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200 animate-in fade-in slide-in-from-left-2"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <Badge
                          variant="outline"
                          className="flex-shrink-0 h-6 w-6 p-0 justify-center font-bold bg-gradient-to-br from-primary/10 to-primary/5"
                        >
                          {qa.questionNumber}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-relaxed">{qa.question}</p>
                        </div>
                        <Badge
                          className={`flex-shrink-0 capitalize transition-all duration-200 ${
                            qa.answer === "yes"
                              ? "bg-chart-1 hover:bg-chart-1/90 shadow-sm"
                              : qa.answer === "no"
                                ? "bg-destructive hover:bg-destructive/90 shadow-sm"
                                : "bg-muted-foreground hover:bg-muted-foreground/90 shadow-sm"
                          }`}
                        >
                          {qa.answer}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
