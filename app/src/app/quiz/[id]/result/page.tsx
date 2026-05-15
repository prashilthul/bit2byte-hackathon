"use client"

import { useSearchParams, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Suspense } from "react"

function ResultContent() {
  const searchParams = useSearchParams()
  const { id } = useParams<{ id: string }>()

  const score = parseInt(searchParams.get("score") || "0")
  const total = parseInt(searchParams.get("total") || "0")
  const xp = parseInt(searchParams.get("xp") || "0")
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  const getGrade = () => {
    if (percentage >= 80) return { label: "Excellent!", icon: "🌟", color: "text-primary" }
    if (percentage >= 60) return { label: "Good job!", icon: "👍", color: "text-primary" }
    if (percentage >= 40) return { label: "Keep trying!", icon: "💪", color: "text-warning" }
    return { label: "Don't give up!", icon: "📚", color: "text-canvas-soft/50" }
  }

  const grade = getGrade()
  const stars = Math.min(3, Math.ceil(percentage / 33))

  return (
    <div className="min-h-[calc(100vh-64px)] bg-ink flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <Card className="relative max-w-lg w-full bg-surface-card rounded-2xl p-8 md:p-12 text-center border-0">
        <CardHeader className="pb-6">
          <div className="text-7xl mb-4">{grade.icon}</div>
          <CardTitle className={`text-display-md ${grade.color}`}>
            {grade.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Score circle */}
          <div className="relative mx-auto mb-8 w-40 h-40 rounded-full bg-ink border-2 border-primary/20 flex items-center justify-center">
            <div className="text-center">
              <span className="text-display-lg text-primary font-black">
                {score}
              </span>
              <span className="text-display-lg text-canvas-soft/30 font-black">
                /{total}
              </span>
            </div>
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`text-3xl transition-all duration-300 ${
                  s <= stars ? "scale-100" : "scale-75 opacity-20"
                }`}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="rounded-xl bg-ink border border-primary/5 p-4">
              <p className="text-display-xs text-primary font-black">
                {percentage}%
              </p>
              <p className="text-caption text-canvas-soft/40 uppercase tracking-wider mt-1">
                Score
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
              <p className="text-display-xs text-primary font-black">
                +{xp}
              </p>
              <p className="text-caption text-primary/60 uppercase tracking-wider mt-1">
                XP Earned
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/quiz/${id}`}>
              <Button
                variant="secondary"
                size="md"
                className="w-full sm:w-auto bg-surface-elevated text-canvas-soft hover:bg-surface-card cursor-pointer"
              >
                Retry Quiz
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto cursor-pointer"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-64px)] bg-ink flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  )
}
