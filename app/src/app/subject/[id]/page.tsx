"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { getStudyMaterialBySubject, getQuizzesBySubject } from "@/lib/firestore"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Brain, Calculator, FlaskConical, Cpu, Cog, Trophy, Sparkles, ChevronRight } from "lucide-react"
import { useToast } from "@/context/ToastContext"

interface Material {
  id: string
  title: string
  grade: number
  order: number
}

interface Quiz {
  id: string
  title: string
  grade: number
  xpReward: number
}

const THEMES: Record<string, { color: string; icon: typeof Calculator; label: string }> = {
  math: { color: "#9fe870", icon: Calculator, label: "Mathematics" },
  mathematics: { color: "#9fe870", icon: Calculator, label: "Mathematics" },
  science: { color: "#38c8ff", icon: FlaskConical, label: "Science" },
  technology: { color: "#ff6b9d", icon: Cpu, label: "Technology" },
  engineering: { color: "#ffd11a", icon: Cog, label: "Engineering" },
}

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>()
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [materials, setMaterials] = useState<Material[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const theme = THEMES[id.toLowerCase()] || {
    color: "#9fe870",
    icon: Calculator,
    label: id.charAt(0).toUpperCase() + id.slice(1),
  }
  const SubjectIcon = theme.icon
  const c = theme.color

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace("/login")
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const [materialData, quizData] = await Promise.all([
          getStudyMaterialBySubject(id),
          getQuizzesBySubject(id),
        ])
        setMaterials(materialData as Material[])
        setQuizzes(quizData as Quiz[])
      } catch {
        setError("Failed to load subject data.")
        toast("Failed to load subject data.", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user, authLoading, router, toast])

  const doneCount = quizzes.filter((q) => userData?.quizzesDone?.includes(q.id)).length
  const totalXp = quizzes.reduce((sum, q) => sum + q.xpReward, 0)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-surface-card rounded-xl p-8 text-center border-0">
          <div className="text-4xl mb-4">⚠️</div>
          <CardTitle className="text-display-xs text-canvas-soft mb-2">Error</CardTitle>
          <p className="text-body-sm text-canvas-soft/50 mb-6">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()} className="cursor-pointer">
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink" style={{ "--c": c } as React.CSSProperties}>
      {/* Themed background glow */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: `${c}06`, filter: "blur(140px)" }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: `${c}04`, filter: "blur(100px)" }} />

      <div className="relative mx-auto max-w-5xl px-4 py-8 md:py-14">
        {/* ─── Header ─── */}
        <div className="mb-10 md:mb-14">
          <Link
            href="/dashboard"
            className="text-body-sm mb-4 inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: `${c}99` }}
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-5 mt-3">
            <div
              className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0"
              style={{ background: `${c}18`, borderColor: `${c}30`, color: c }}
            >
              <SubjectIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-display-sm md:text-display-md" style={{ color: c }}>
                {theme.label}
              </h1>
              <p className="text-body-sm mt-1 text-canvas-soft/40">
                {materials.length} material{materials.length !== 1 ? "s" : ""} &middot;{" "}
                {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} &middot;{" "}
                {totalXp} XP available
              </p>
            </div>
          </div>
        </div>

        {/* ─── Stats row ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12 md:mb-16">
          <StatCard label="Materials" value={materials.length} icon={BookOpen} color={c} />
          <StatCard label="Quizzes" value={quizzes.length} icon={Brain} color={c} />
          <StatCard label="Completed" value={doneCount} icon={Trophy} color={c} />
          <StatCard label="Total XP" value={totalXp} icon={Sparkles} color={c} suffix="" />
        </div>

        {/* ─── Study Materials ─── */}
        <section className="mb-12 md:mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-display-xs text-canvas-soft flex items-center gap-2">
              <BookOpen className="w-5 h-5" style={{ color: c }} /> Study Material
            </h2>
            <span className="text-caption text-canvas-soft/40">
              {materials.length} item{materials.length !== 1 ? "s" : ""}
            </span>
          </div>

          {materials.length === 0 ? (
            <div className="rounded-2xl bg-surface-elevated border border-primary/5 p-12 text-center">
              <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: `${c}40` }} />
              <p className="text-body-sm text-canvas-soft/40">No study material available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.sort((a, b) => a.order - b.order).map((mat) => (
                <MaterialCard key={mat.id} material={mat} color={c} />
              ))}
            </div>
          )}
        </section>

        {/* ─── Themed divider ─── */}
        <div className="flex items-center gap-4 mb-12 md:mb-16">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${c}30, transparent)` }} />
          <Brain className="w-4 h-4" style={{ color: `${c}50` }} />
          <div className="flex-1 h-px" style={{ background: `linear-gradient(270deg, ${c}30, transparent)` }} />
        </div>

        {/* ─── Quizzes ─── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-display-xs text-canvas-soft flex items-center gap-2">
              <Brain className="w-5 h-5" style={{ color: c }} /> Quizzes
            </h2>
            <span className="text-caption text-canvas-soft/40">
              {doneCount}/{quizzes.length} done
            </span>
          </div>

          {quizzes.length === 0 ? (
            <div className="rounded-2xl bg-surface-elevated border border-primary/5 p-12 text-center">
              <Brain className="w-10 h-10 mx-auto mb-3" style={{ color: `${c}40` }} />
              <p className="text-body-sm text-canvas-soft/40">No quizzes available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((quiz) => {
                const done = userData?.quizzesDone?.includes(quiz.id)
                return <QuizCard key={quiz.id} quiz={quiz} color={c} done={done} />
              })}
            </div>
          )}
        </section>

        {/* ─── Bottom spacer ─── */}
        <div className="h-12" />
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, suffix = "" }: {
  label: string
  value: number
  icon: typeof BookOpen
  color: string
  suffix?: string
}) {
  return (
    <div className="rounded-xl bg-surface-card border p-4 text-center" style={{ borderColor: `${color}12` }}>
      <Icon className="w-4 h-4 mx-auto mb-2" style={{ color: `${color}70` }} />
      <p className="text-display-xs font-black" style={{ color }}>{value}{suffix}</p>
      <p className="text-caption mt-0.5 text-canvas-soft/40">{label}</p>
    </div>
  )
}

function MaterialCard({ material, color }: { material: Material; color: string }) {
  return (
    <Link href={`/material/${material.id}`}>
      <div
        className="group rounded-xl bg-surface-card border p-5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
        style={{ borderColor: `${color}14` }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}40` }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${color}14` }}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}14`, color }}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-body-md-strong text-canvas-soft leading-snug">
              {material.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-caption px-2 py-0.5 rounded-full text-canvas-soft/40" style={{ background: `${color}10` }}>
                Grade {material.grade}
              </span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" style={{ color: `${color}50` }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function QuizCard({ quiz, color, done }: { quiz: Quiz; color: string; done: boolean }) {
  return (
    <Link href={`/quiz/${quiz.id}`}>
      <div
        className="group rounded-xl bg-surface-card border p-5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
        style={{ borderColor: `${color}14` }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}40` }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${color}14` }}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: done ? `${color}20` : `${color}10`, color: done ? color : `${color}70` }}>
            {done ? <Trophy className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-body-md-strong text-canvas-soft truncate leading-snug">
                {quiz.title}
              </h3>
              {done && (
                <Badge className="shrink-0 text-[10px] px-2 py-0.5 text-primary" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                  Done
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-caption px-2 py-0.5 rounded-full text-canvas-soft/40" style={{ background: `${color}10` }}>
                +{quiz.xpReward} XP
              </span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" style={{ color: `${color}50` }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
