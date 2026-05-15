"use client"
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useRef, useCallback } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useAuth } from "@/context/AuthContext"
import { getSubjectsByGrade } from "@/lib/firestore"
import { getRatingHistory, getRating } from "@/lib/battle"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/context/ToastContext"
import ReactEChartsCore from "echarts-for-react/lib/core"
import * as echarts from "echarts/core"
import { LineChart, BarChart } from "echarts/charts"
import { GridComponent, TooltipComponent } from "echarts/components"
import { CanvasRenderer } from "echarts/renderers"
echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer])
import {
  Calculator,
  FlaskConical,
  Cpu,
  Cog,
  BookOpen,
  Globe,
  Trophy,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Swords,
} from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

interface Subject {
  id: string
  name: string
  grades: number[]
  icon: string
}

interface SubjectMeta {
  icon: typeof Calculator
  gradient: string
  accent: string
  pattern: string
  description: string
}

const SUBJECT_META: Record<string, SubjectMeta> = {
  // M — Mathematics (lime green)
  math: {
    icon: Calculator,
    gradient: "from-[#9fe870] to-[#6bc43d]",
    accent: "bg-[#9fe870]/10 text-[#9fe870] border-[#9fe870]/20",
    pattern: "radial-gradient(circle at 30% 70%, rgba(159,232,112,0.06) 0%, transparent 50%)",
    description: "Numbers, equations, and logic",
  },
  mathematics: {
    icon: Calculator,
    gradient: "from-[#9fe870] to-[#6bc43d]",
    accent: "bg-[#9fe870]/10 text-[#9fe870] border-[#9fe870]/20",
    pattern: "radial-gradient(circle at 30% 70%, rgba(159,232,112,0.06) 0%, transparent 50%)",
    description: "Numbers, equations, and logic",
  },
  // S — Science (cyan)
  science: {
    icon: FlaskConical,
    gradient: "from-[#38c8ff] to-[#0ea5e9]",
    accent: "bg-[#38c8ff]/10 text-[#38c8ff] border-[#38c8ff]/20",
    pattern: "radial-gradient(circle at 70% 30%, rgba(56,200,255,0.06) 0%, transparent 50%)",
    description: "Explore the natural world",
  },
  // T — Technology (pink)
  technology: {
    icon: Cpu,
    gradient: "from-[#ff6b9d] to-[#e64980]",
    accent: "bg-[#ff6b9d]/10 text-[#ff6b9d] border-[#ff6b9d]/20",
    pattern: "radial-gradient(circle at 50% 50%, rgba(255,107,157,0.06) 0%, transparent 50%)",
    description: "Code, systems, and innovation",
  },
  // E — Engineering (yellow)
  engineering: {
    icon: Cog,
    gradient: "from-[#ffd11a] to-[#eab308]",
    accent: "bg-[#ffd11a]/10 text-[#ffd11a] border-[#ffd11a]/20",
    pattern: "radial-gradient(circle at 40% 60%, rgba(255,209,26,0.06) 0%, transparent 50%)",
    description: "Design, build, and create",
  },
  // Fallbacks
  english: {
    icon: BookOpen,
    gradient: "from-[#ffc091] to-[#f59e0b]",
    accent: "bg-[#ffc091]/10 text-[#ffc091] border-[#ffc091]/20",
    pattern: "radial-gradient(circle at 60% 60%, rgba(255,192,145,0.06) 0%, transparent 50%)",
    description: "Language and literature",
  },
  history: {
    icon: Globe,
    gradient: "from-[#ffd11a] to-[#eab308]",
    accent: "bg-[#ffd11a]/10 text-[#ffd11a] border-[#ffd11a]/20",
    pattern: "radial-gradient(circle at 40% 40%, rgba(255,209,26,0.06) 0%, transparent 50%)",
    description: "Past events and civilizations",
  },
}

const DEFAULT_META: SubjectMeta = {
  icon: BookOpen,
  gradient: "from-[#9fe870] to-[#6bc43d]",
  accent: "bg-[#9fe870]/10 text-[#9fe870] border-[#9fe870]/20",
  pattern: "radial-gradient(circle at 50% 50%, rgba(159,232,112,0.06) 0%, transparent 50%)",
  description: "Start learning",
}

const SUBJECT_COLORS: Record<string, string> = {
  math: "#9fe870",
  mathematics: "#9fe870",
  science: "#38c8ff",
  technology: "#ff6b9d",
  engineering: "#ffd11a",
  english: "#ffc091",
  history: "#ffd11a",
}

export default function DashboardContent() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (!userData) return

    const load = async () => {
      try {
        const data = await getSubjectsByGrade(userData.grade || 8)
        setSubjects(data as Subject[])
      } catch {
        toast("Failed to load subjects. Check your connection.", "error")
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [user, userData, authLoading, router, toast])

  return (
    <DashboardScene
      subjects={subjects}
      loading={authLoading || fetching}
      userData={userData}
      quizzesDone={userData?.quizzesDone?.length || 0}
      xp={userData?.xp || 0}
      grade={userData?.grade}
    />
  )
}

type UserData = Record<string, unknown> | null | undefined

function DashboardScene(props: {
  subjects: Subject[]
  loading: boolean
  userData: UserData
  quizzesDone: number
  xp: number
  grade: number
}) {
  const { subjects, loading, userData, quizzesDone, xp, grade } = props
  const { user } = useAuth()
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loading || subjects.length === 0) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // ── Header entrance ──
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          y: 40,
          opacity: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "power3.out",
        })
      }

      // ── Stats bar entrance ──
      if (statsRef.current) {
        gsap.from(statsRef.current.children, {
          y: 30,
          opacity: 0,
          stagger: 0.1,
          duration: 0.6,
          delay: 0.3,
          ease: "power2.out",
        })
      }

      // ── Parallax orbs ──
      mm.add("(min-width: 768px)", () => {
        if (orb1Ref.current) {
          gsap.to(orb1Ref.current, {
            y: -120,
            ease: "none",
            scrollTrigger: {
              trigger: orb1Ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 2,
            },
          })
        }
        if (orb2Ref.current) {
          gsap.to(orb2Ref.current, {
            y: 80,
            ease: "none",
            scrollTrigger: {
              trigger: orb2Ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5,
            },
          })
        }
      })

      // ── Cards stagger reveal ──
      const cards = gridRef.current?.querySelectorAll(".subject-card")
      if (cards?.length) {
        gsap.from(cards, {
          y: 60,
          opacity: 0,
          stagger: 0.08,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        })
      }

      ScrollTrigger.refresh()
    }, [gridRef, headerRef, statsRef, orb1Ref, orb2Ref])

    return () => ctx.revert()
  }, [loading, subjects])

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const featured = subjects[0]
  const rest = subjects.slice(1)

  return (
    <div className="min-h-screen bg-ink relative overflow-hidden">
      {/* Decorative background orbs */}
      <div
        ref={orb1Ref}
        className="fixed top-20 -left-32 w-[500px] h-[500px] rounded-full bg-primary/4 blur-[120px] pointer-events-none will-change-transform"
      />
      <div
        ref={orb2Ref}
        className="fixed bottom-40 -right-32 w-[400px] h-[400px] rounded-full bg-[#38c8ff]/3 blur-[100px] pointer-events-none will-change-transform"
      />

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(159,232,112,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(159,232,112,0.4) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-14">
        {/* ── Header ── */}
        <div ref={headerRef} className="mb-10 md:mb-14">
          <div className="flex items-center gap-2.5 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary/70 uppercase tracking-[0.12em]">
              Dashboard
            </span>
          </div>
          <h1 className="text-[clamp(32px,5vw,52px)] font-black tracking-tighter text-canvas-soft leading-[0.9]">
            Welcome back
            {userData?.name ? (
              <>
                , <span className="text-primary">{String(userData.name)}</span>
              </>
            ) : ""}
          </h1>
          <p className="mt-3 text-body-md text-canvas-soft/40 max-w-xl">
            Pick up where you left off. Your subjects and progress are waiting.
          </p>
        </div>

        {/* ── Stats bar ── */}
        <div
          ref={statsRef}
          className="flex flex-wrap items-center gap-3 md:gap-5 mb-10 md:mb-14"
        >
          <div className="flex items-center gap-2 rounded-xl bg-surface-card border border-primary/5 px-4 py-2.5">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm text-canvas-soft/60">
              <span className="text-primary font-bold">{xp}</span> XP
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-surface-card border border-primary/5 px-4 py-2.5">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm text-canvas-soft/60">
              <span className="text-primary font-bold">{quizzesDone}</span> quiz
              {quizzesDone !== 1 ? "zes" : ""} done
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-surface-card border border-primary/5 px-4 py-2.5">
            <span className="text-sm text-canvas-soft/60">
              Grade <span className="text-primary font-bold">{grade || "—"}</span>
            </span>
          </div>
        </div>

        {/* ── Empty State ── */}
        {subjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen className="w-14 h-14 text-canvas-soft/20 mb-5" />
            <h2 className="text-display-xs text-canvas-soft mb-2">No subjects yet</h2>
            <p className="text-body-sm text-canvas-soft/40 max-w-sm mb-6">
              No subjects found for grade <span className="text-primary font-semibold">{grade || "—"}</span>.
              Make sure you&apos;ve seeded data and your Firestore rules allow reads.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/seed"
                className="inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary-active transition-colors"
              >
                Seed Database
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-xl bg-surface-card border border-primary/5 text-canvas-soft/70 px-5 py-2.5 text-sm font-semibold hover:border-primary/20 transition-colors cursor-pointer"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}

        {/* ── Subject Cards ── */}
        {subjects.length > 0 && (
          <div ref={gridRef}>
            {/* Featured card - spans full width */}
            {featured && (
              <Link
                key={featured.id}
                href={`/subject/${featured.id}`}
                className="subject-card block mb-5 md:mb-6"
              >
                <FeaturedCard subject={featured} />
              </Link>
            )}

            {/* Rest - responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {rest.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/subject/${subject.id}`}
                  className="subject-card group block"
                >
                  <CompactCard subject={subject} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {subjects.length > 0 && (
          <div className="mt-16 text-center">
            <p className="text-caption text-canvas-soft/15 tracking-wider uppercase">
              Scroll to explore all subjects
            </p>
          </div>
        )}

        {/* ─── Stats Section ─── */}
        <DashboardStats uid={user!.uid} />
      </div>
    </div>
  )
}

interface QuizResult {
  score: number
  total: number
  completedAt: { toMillis: () => number } | number
}

function DashboardStats({ uid }: { uid?: string | null }) {
  const [ratingData, setRatingData] = useState<{ rating: number; timestamp: number }[]>([])
  const [quizData, setQuizData] = useState<QuizResult[]>([])
  const [battleRating, setBattleRating] = useState(0)
  const [flashcardRating, setFlashcardRating] = useState(0)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async (u: string) => {
    try {
      const [battleHist, , br, fr, quizSnap] = await Promise.all([
        getRatingHistory(u, "battle"),
        getRatingHistory(u, "flashcards"),
        getRating(u, "battle"),
        getRating(u, "flashcards"),
        getDocs(
          query(
            collection(db!, "quizResults"),
            where("uid", "==", u),
            orderBy("completedAt", "desc"),
            limit(20)
          )
        ),
      ])
      setRatingData(battleHist.map((r) => ({ rating: r.rating, timestamp: r.timestamp })))
      setQuizData(quizSnap.docs.map((d) => d.data() as QuizResult).reverse())
      setBattleRating(br)
      setFlashcardRating(fr)
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!uid) return
    refresh(uid)

    // Refresh on visibility change (user returns from quiz/battle)
    const onVisible = () => { if (document.visibilityState === "visible") refresh(uid) }
    document.addEventListener("visibilitychange", onVisible)

    // Poll every 15s as a fallback
    const interval = setInterval(() => refresh(uid), 15000)

    return () => {
      document.removeEventListener("visibilitychange", onVisible)
      clearInterval(interval)
    }
  }, [uid, refresh])

  if (loading && uid) return null
  const hasNoData = battleRating === 1000 && flashcardRating === 1000 && quizData.length === 0 && ratingData.length === 0
  if (hasNoData && !loading) return null

  const ratingOption = {
    tooltip: { trigger: "axis" as const, theme: "dark" },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "8%", containLabel: true },
    xAxis: { type: "category" as const, data: ratingData.map((r) => new Date(r.timestamp).toLocaleDateString()), axisLabel: { color: "#868685", fontSize: 10 } },
    yAxis: { type: "value" as const, splitLine: { lineStyle: { color: "#ffffff10" } }, axisLabel: { color: "#868685" } },
    series: [{
      data: ratingData.map((r) => r.rating),
      type: "line" as const,
      smooth: true,
      lineStyle: { color: "#9fe870", width: 2 },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "#9fe87040" }, { offset: 1, color: "#9fe87005" }]) },
      symbol: "circle", symbolSize: 6, itemStyle: { color: "#9fe870" },
    }],
  }

  const quizOption = {
    tooltip: { trigger: "axis" as const, theme: "dark" },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "8%", containLabel: true },
    xAxis: { type: "category" as const, data: quizData.map(() => ""), axisLabel: { color: "#868685", fontSize: 10 } },
    yAxis: { type: "value" as const, max: 100, splitLine: { lineStyle: { color: "#ffffff10" } }, axisLabel: { color: "#868685", formatter: "{value}%" } },
    series: [{
      data: quizData.map((q) => Math.round((q.score / q.total) * 100)),
      type: "bar" as const,
      barWidth: "60%",
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "#38c8ff" }, { offset: 1, color: "#38c8ff30" }]), borderRadius: [4, 4, 0, 0] },
    }],
  }

  return (
    <div className="mt-16 md:mt-20 space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-display-xs text-canvas-soft">Your Stats</h2>
      </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="rounded-xl bg-surface-card border border-primary/5 p-4 text-center">
            <Swords className="w-4 h-4 mx-auto mb-1.5" style={{ color: "#ff6b9d" }} />
            <p className="text-display-xs font-black" style={{ color: "#ff6b9d" }}>{battleRating}</p>
            <p className="text-caption text-canvas-soft/30 uppercase tracking-wider mt-0.5">Battle</p>
          </div>
          <div className="rounded-xl bg-surface-card border border-primary/5 p-4 text-center">
            <BookOpen className="w-4 h-4 mx-auto mb-1.5" style={{ color: "#38c8ff" }} />
            <p className="text-display-xs font-black" style={{ color: "#38c8ff" }}>{flashcardRating}</p>
            <p className="text-caption text-canvas-soft/30 uppercase tracking-wider mt-0.5">Flashcards</p>
          </div>
          <div className="rounded-xl bg-surface-card border border-primary/5 p-4 text-center">
            <Sparkles className="w-4 h-4 mx-auto mb-1.5" style={{ color: "#9fe870" }} />
            <p className="text-display-xs font-black" style={{ color: "#9fe870" }}>{quizData.length}</p>
            <p className="text-caption text-canvas-soft/30 uppercase tracking-wider mt-0.5">Quizzes</p>
          </div>
          <div className="rounded-xl bg-surface-card border border-primary/5 p-4 text-center">
            <Trophy className="w-4 h-4 mx-auto mb-1.5" style={{ color: "#ffd11a" }} />
            <p className="text-display-xs font-black" style={{ color: "#ffd11a" }}>{ratingData.length}</p>
            <p className="text-caption text-canvas-soft/30 uppercase tracking-wider mt-0.5">Battles</p>
          </div>
        </div>

      <div className="grid md:grid-cols-2 gap-4">
        {ratingData.length > 0 && (
          <div className="rounded-2xl bg-surface-card border border-primary/5 p-5">
            <h3 className="text-body-sm-strong text-canvas-soft mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: "#ff6b9d" }} /> Battle Rating
            </h3>
            <ReactEChartsCore echarts={echarts} option={ratingOption} style={{ height: 200 }} notMerge />
          </div>
        )}
        {quizData.length > 0 && (
          <div className="rounded-2xl bg-surface-card border border-primary/5 p-5">
            <h3 className="text-body-sm-strong text-canvas-soft mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" /> Quiz Scores
            </h3>
            <ReactEChartsCore echarts={echarts} option={quizOption} style={{ height: 200 }} notMerge />
          </div>
        )}
      </div>
    </div>
  )
}

function FeaturedCard({ subject }: { subject: Subject }) {
  const meta = SUBJECT_META[subject.name.toLowerCase()] || DEFAULT_META
  const Icon = meta.icon
  const color = SUBJECT_COLORS[subject.name.toLowerCase()] || "#9fe870"

  return (
    <div className="relative rounded-2xl bg-surface-card border border-primary/5 overflow-hidden transition-colors duration-300 hover:border-[var(--card-color)]/30 group"
      style={{ "--card-color": color } as React.CSSProperties}
    >
      <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}80, ${color}20)` }}
      />
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div
            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl border flex items-center justify-center shrink-0"
            style={{ background: `${color}15`, borderColor: `${color}30`, color }}
          >
            <Icon className="w-7 h-7 md:w-8 md:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-display-sm text-canvas-soft group-hover:text-[var(--card-color)] transition-colors">
                {subject.name}
              </h2>
              <span className="hidden sm:flex items-center gap-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: `${color}99` }}
              >
                Explore <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-body-sm text-canvas-soft/40">{meta.description}</p>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-full px-4 py-1.5 text-sm"
            style={{ background: `${color}10`, border: `1px solid ${color}20`, color: `${color}bb` }}
          >
            Grades {Math.min(...subject.grades)}–{Math.max(...subject.grades)}
          </div>
        </div>
      </div>
    </div>
  )
}

function CompactCard({ subject }: { subject: Subject }) {
  const meta = SUBJECT_META[subject.name.toLowerCase()] || DEFAULT_META
  const Icon = meta.icon
  const color = SUBJECT_COLORS[subject.name.toLowerCase()] || "#9fe870"

  return (
    <div
      className="relative rounded-2xl bg-surface-card border border-primary/5 p-6 transition-colors duration-300 hover:border-[var(--card-color)]/30 h-full group overflow-hidden"
      style={{ "--card-color": color, backgroundImage: meta.pattern } as React.CSSProperties}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}60, transparent)` }}
      />
      <div className="relative z-10">
        <div
          className="w-11 h-11 rounded-xl border flex items-center justify-center mb-4"
          style={{ background: `${color}12`, borderColor: `${color}25`, color }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-display-xs text-canvas-soft group-hover:text-[var(--card-color)] transition-colors mb-1">
          {subject.name}
        </h3>
        <p className="text-body-sm text-canvas-soft/35 mb-4">{meta.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-canvas-soft/25 font-medium uppercase tracking-wider">
            Grades {Math.min(...subject.grades)}–{Math.max(...subject.grades)}
          </span>
          <ArrowUpRight
            className="w-4 h-4 transition-colors"
            style={{ color: `${color}50` }}
          />
        </div>
      </div>
    </div>
  )
}
