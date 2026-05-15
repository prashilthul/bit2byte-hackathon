"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { getQuizById } from "@/lib/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useToast } from "@/context/ToastContext"
import { gsap } from "gsap"
import { Check, X, ArrowRight, ChevronLeft } from "lucide-react"

interface Question {
  q: string
  options: string[]
  answer: number
}

interface Quiz {
  id: string
  title: string
  subjectId: string
  grade: number
  xpReward: number
  questions: Question[]
}

export default function QuizPage() {
  const { id } = useParams<{ id: string }>()
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [finished, setFinished] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const swiped = useRef(false)
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const answeredRef = useRef(false)
  const currentIdxRef = useRef(0)
  const advancingRef = useRef(false)

  // Keep refs in sync with state
  useEffect(() => { answeredRef.current = answered }, [answered])
  useEffect(() => { currentIdxRef.current = currentIndex }, [currentIndex])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace("/login"); return }

    const fetch = async () => {
      try {
        setLoading(true)
        const data = await getQuizById(id)
        if (data) setQuiz(data as Quiz)
        else setError("Quiz not found.")
      } catch {
        setError("Failed to load quiz.")
        toast("Failed to load quiz.", "error")
      } finally { setLoading(false) }
    }
    fetch()
  }, [id, user, authLoading, router, toast])

  const currentQ = quiz?.questions[currentIndex]
  const total = quiz?.questions.length || 0
  const isDone = userData?.quizzesDone?.includes(id)

  // Card entrance animation
  useEffect(() => {
    if (!cardRef.current || finished) return
    gsap.set(cardRef.current, { x: 0 })
    gsap.fromTo(cardRef.current,
      { y: 60, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }
    )
  }, [currentIndex, finished])

  const handleSelect = useCallback((optIdx: number) => {
    if (answered || !quiz) return
    setSelected(optIdx)
    setAnswered(true)
    const correct = optIdx === quiz.questions[currentIndex].answer
    setResults((prev) => [...prev, correct])
  }, [answered, quiz, currentIndex])

  const goNext = useCallback(() => {
    if (advancingRef.current) return
    advancingRef.current = true
    if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null }
    if (!quiz) { advancingRef.current = false; return }
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1)
      setSelected(null)
      setAnswered(false)
      swiped.current = false
    } else {
      setFinished(true)
    }
    setTimeout(() => { advancingRef.current = false }, 300)
  }, [currentIndex, total, quiz])

  // Auto-advance after selecting an answer
  useEffect(() => {
    if (answered && !finished) {
      autoTimerRef.current = setTimeout(() => {
        if (autoTimerRef.current === null) return // Already cancelled
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            x: 300, opacity: 0, duration: 0.2, ease: "power2.in",
            onComplete: goNext,
          })
        } else { goNext() }
      }, 1200)
    }
    return () => { if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null } }
  }, [answered, finished, goNext])

  const handleSubmit = async () => {
    if (!quiz || !user || submitting) return
    try {
      setSubmitting(true)
      const score = results.filter(Boolean).length
      const { submitQuizResult } = await import("@/lib/firestore")
      await submitQuizResult(user.uid, id, score, total, quiz.xpReward)
      router.push(`/quiz/${id}/result?score=${score}&total=${total}&xp=${quiz.xpReward}`)
    } catch {
      toast("Failed to save results.", "error")
    } finally { setSubmitting(false) }
  }

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!answered || swiped.current) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null }
      swiped.current = true
      const dir = dx > 0 ? 1 : -1
      gsap.to(cardRef.current, {
        x: dir * 400, opacity: 0, rotate: dir * 15, duration: 0.3, ease: "power2.in",
        onComplete: goNext,
      })
    }
  }

  // Keyboard (uses refs to avoid stale closures)
  useEffect(() => {
    if (finished) return
    const onKey = (e: KeyboardEvent) => {
      if (!answeredRef.current && e.key >= "1" && e.key <= "4") {
        const idx = parseInt(e.key) - 1
        if (quiz && idx < (quiz.questions[currentIdxRef.current]?.options.length || 0)) handleSelect(idx)
      }
      if (answeredRef.current && (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Enter")) {
        if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null }
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            x: 300, opacity: 0, duration: 0.2, ease: "power2.in",
            onComplete: goNext,
          })
        } else { goNext() }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [finished, quiz, handleSelect, goNext])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-surface-card rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-display-xs text-canvas-soft mb-2">Not found</h2>
          <p className="text-body-sm text-canvas-soft/50 mb-6">{error || "This quiz doesn't exist."}</p>
          <Link href="/dashboard"><Button variant="primary" className="cursor-pointer">Dashboard</Button></Link>
        </div>
      </div>
    )
  }

  if (isDone && !finished) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-surface-card rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-display-xs text-canvas-soft mb-2">Already Completed</h2>
          <p className="text-body-sm text-canvas-soft/50 mb-6">You&apos;ve already finished this quiz.</p>
          <div className="flex gap-3 justify-center">
            <Link href={`/subject/${quiz.subjectId}`}><Button variant="secondary" className="bg-surface-elevated text-canvas-soft hover:bg-surface-card cursor-pointer">Back</Button></Link>
            <Link href="/profile"><Button variant="primary" className="cursor-pointer">Profile</Button></Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Results Screen ──
  if (finished) {
    const score = results.filter(Boolean).length
    const pct = total > 0 ? Math.round((score / total) * 100) : 0
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12">
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="relative max-w-md w-full bg-surface-card rounded-2xl p-8 md:p-10 text-center">
          <div className="text-6xl mb-4">{pct >= 80 ? "🌟" : pct >= 60 ? "👍" : pct >= 40 ? "💪" : "📚"}</div>
          <h2 className="text-display-sm text-canvas-soft mb-2">
            {pct >= 80 ? "Excellent!" : pct >= 60 ? "Good job!" : pct >= 40 ? "Keep trying!" : "Don't give up!"}
          </h2>
          <div className="mx-auto my-6 w-36 h-36 rounded-full bg-ink border-2 border-primary/20 flex items-center justify-center">
            <div>
              <span className="text-display-lg text-primary font-black">{score}</span>
              <span className="text-display-lg text-canvas-soft/30 font-black">/{total}</span>
            </div>
          </div>
          <div className="flex justify-center gap-1 mb-6">
            {results.map((r, i) => (
              <span key={i} className={`w-3 h-3 rounded-full ${r ? "bg-primary" : "bg-negative"}`} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="rounded-xl bg-ink border border-primary/5 p-4">
              <p className="text-display-xs text-primary font-black">{pct}%</p>
              <p className="text-caption text-canvas-soft/40 uppercase tracking-wider mt-1">Score</p>
            </div>
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
              <p className="text-display-xs text-primary font-black">+{quiz.xpReward}</p>
              <p className="text-caption text-primary/60 uppercase tracking-wider mt-1">XP Earned</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" onClick={() => { setCurrentIndex(0); setSelected(null); setAnswered(false); setResults([]); setFinished(false) }}
              className="bg-surface-elevated text-canvas-soft hover:bg-surface-card cursor-pointer w-full">Retry</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={submitting} className="cursor-pointer">
              {submitting ? "Saving..." : "Save & Finish"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Flashcard ──
  return (
    <div className="min-h-screen bg-ink">
      <div className="fixed top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-2xl px-4 py-6 md:py-10 md:min-h-[calc(100vh-4rem)] md:flex md:flex-col md:justify-center">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <Link href={`/subject/${quiz.subjectId}`} className="w-9 h-9 rounded-xl bg-surface-card border border-primary/5 flex items-center justify-center text-canvas-soft/40 hover:text-primary hover:border-primary/20 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <Badge className="bg-surface-elevated text-canvas-soft/60 border-0">{quiz.xpReward} XP</Badge>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {quiz.questions.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
              i < currentIndex ? "bg-primary" : i === currentIndex ? "bg-primary/60" : "bg-surface-elevated"
            }`} />
          ))}
        </div>

        {/* Card */}
        <div
          ref={cardRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="select-none rounded-2xl bg-surface-card border border-primary/5 p-6 md:p-8 touch-pan-y"
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-caption text-canvas-soft/30 uppercase tracking-wider font-semibold">
              Question {currentIndex + 1} of {total}
            </span>
            {answered && (
              <span className={`flex items-center gap-1 text-sm font-semibold ${
                results[results.length - 1] ? "text-primary" : "text-negative"
              }`}>
                {results[results.length - 1] ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {results[results.length - 1] ? "Correct" : "Wrong"}
              </span>
            )}
          </div>

          {/* Question */}
          <h2 className="text-display-xs text-canvas-soft leading-snug mb-8">
            {currentQ?.q}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQ?.options.map((opt, oi) => {
              const isSelected = selected === oi
              const isCorrect = oi === currentQ.answer
              const showFeedback = answered

              let border = "border-surface-elevated"
              let bg = "bg-ink"
              let text = "text-canvas-soft/70"

              if (showFeedback) {
                if (isCorrect) {
                  border = "border-primary"; bg = "bg-primary/10"; text = "text-primary"
                } else if (isSelected && !isCorrect) {
                  border = "border-negative/50"; bg = "bg-negative/10"; text = "text-negative"
                } else {
                  border = "border-surface-elevated"; bg = "bg-ink"; text = "text-canvas-soft/30"
                }
              } else if (isSelected) {
                border = "border-primary/50"; bg = "bg-primary/5"; text = "text-canvas-soft"
              }

              return (
                <button
                  key={oi}
                  onClick={() => handleSelect(oi)}
                  disabled={answered}
                  className={`w-full text-left rounded-xl border-2 px-5 py-4 text-body-md transition-all duration-200 cursor-pointer ${border} ${bg} ${text}`}
                >
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mr-3 shrink-0 ${
                    answered && isCorrect
                      ? "bg-primary text-on-primary"
                      : answered && isSelected && !isCorrect
                        ? "bg-negative text-white"
                        : isSelected
                          ? "bg-primary/20 text-primary"
                          : "bg-surface-elevated text-canvas-soft/40"
                  }`}>
                    {answered && isCorrect ? "✓" : answered && isSelected && !isCorrect ? "✗" : String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>

          {/* Bottom action */}
          <div className="mt-8 flex items-center justify-between">
            <span className="text-caption text-canvas-soft/20">
              {answered
                ? "Swipe → or press → for next"
                : "Tap an option, or press 1–4"}
            </span>
            {answered && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null }
                  if (cardRef.current) {
                    gsap.to(cardRef.current, { x: 300, opacity: 0, duration: 0.2, ease: "power2.in", onComplete: goNext })
                  }
                }}
                className="cursor-pointer"
              >
                {currentIndex < total - 1 ? "Next" : "Finish"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Swipe hint for mobile */}
        <p className="mt-4 text-center text-caption text-canvas-soft/15 md:hidden">
          Swipe right &rarr; next card
        </p>
      </div>
    </div>
  )
}
