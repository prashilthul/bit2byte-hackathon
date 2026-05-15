/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { Play, Pause, Trophy, Brain, Timer, ArrowLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuizQ {
  q: string
  options: string[]
  answer: number
}

interface Lesson {
  id: string
  title: string
  subject: string
  subjectId: string
  videoUrl: string
  transcript: string
  checkpoints: number[]
  color: string
}

const LESSON_DATA: Record<string, Lesson> = {
  l1: {
    id: "l1", title: "Energy Transformation", subject: "Science", subjectId: "science",
    videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
    transcript: "Energy transformation is the process of changing energy from one form to another. A hydroelectric dam converts kinetic energy of flowing water into electrical energy. Solar panels convert light energy into electrical energy. Plants convert light energy into chemical energy through photosynthesis. The law of conservation of energy states that energy cannot be created or destroyed, only transformed.",
    color: "#38c8ff",
    checkpoints: [5, 12],
  },
  l2: {
    id: "l2", title: "Building Simple Circuits", subject: "Technology", subjectId: "technology",
    videoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    transcript: "A simple circuit consists of a power source, conductors, and a load. When the circuit is closed, electrons flow from the negative terminal to the positive terminal. A switch can open or close the circuit. Resistors limit current flow. In a series circuit, components share one path. In a parallel circuit, each component has its own path.",
    color: "#ff6b9d",
    checkpoints: [5, 10],
  },
  l3: {
    id: "l3", title: "Water Filtration Ethics", subject: "Engineering", subjectId: "engineering",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    transcript: "Water filtration removes impurities and contaminants from water to make it safe for drinking. Engineers designing filtration systems must consider cost, accessibility, and environmental impact. In rural areas, affordable and low-maintenance solutions are critical. Ethical engineering means considering who has access to clean water.",
    color: "#ffd11a",
    checkpoints: [5, 12],
  },
  l4: {
    id: "l4", title: "Math in Nature", subject: "Mathematics", subjectId: "math",
    videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
    transcript: "Mathematics appears throughout nature in fascinating patterns. The Fibonacci sequence, golden ratio, and geometric shapes can be found in everything from seashells to galaxies. Hexagons appear in honeycombs. Spirals appear in sunflowers and pinecones. Symmetry is everywhere in butterflies and flowers.",
    color: "#9fe870",
    checkpoints: [5, 10],
  },
}

export default function VideoPlayerPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const lesson = LESSON_DATA[id as string]

  const videoRef = useRef<HTMLVideoElement>(null)
  const triggeredRef = useRef<Set<number>>(new Set())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pregeneratedRef = useRef<Map<number, QuizQ[]>>(new Map())

  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [activeQuiz, setActiveQuiz] = useState<QuizQ[]>([])
  const [quizIdx, setQuizIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [focusScore, setFocusScore] = useState(100)
  const [checkpointCount, setCheckpointCount] = useState(0)

  useEffect(() => {
    if (authLoading) return
    if (!user) router.replace("/login")
  }, [user, authLoading, router])

  useEffect(() => {
    if (!lesson) return
    triggeredRef.current.clear()
    pregeneratedRef.current.clear()
    setStarted(false)
    setPlaying(false)
    setCurrentTime(0)
    setShowQuiz(false)
    setCompleted(false)
    setCorrectCount(0)
    setTotalAnswered(0)
    setFocusScore(100)
    setCheckpointCount(0)
    if (videoRef.current) videoRef.current.load()
  }, [id, lesson])

  // Pre-generate all AI questions from Groq when lesson starts
  const pregenerateAll = useCallback(async () => {
    const promises = lesson.checkpoints.map(async (time) => {
      try {
        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: lesson.transcript, subject: lesson.subject, count: 2 }),
        })
        const data = await res.json()
        if (data.questions?.length > 0) {
          pregeneratedRef.current.set(time, data.questions)
        }
      } catch {
        // Question generation failed — checkpoint will show fallback text
      }
    })
    Promise.all(promises)
  }, [lesson])

  const showCheckpoint = useCallback((time: number) => {
    const aiQuestions = pregeneratedRef.current.get(time)
    setActiveQuiz(aiQuestions || [])
    setQuizIdx(0)
    setSelected(null)
    setShowQuiz(true)
  }, [])

  const handleTimeUpdate = () => {
    if (!videoRef.current || showQuiz) return
    const time = Math.floor(videoRef.current.currentTime)
    setCurrentTime(time)

    for (const cpTime of lesson.checkpoints) {
      if (time >= cpTime && !triggeredRef.current.has(cpTime)) {
        triggeredRef.current.add(cpTime)
        setCheckpointCount((c) => c + 1)
        videoRef.current.pause()
        setPlaying(false)
        showCheckpoint(cpTime)
        break
      }
    }
  }

  const handleSelect = (idx: number) => {
    if (selected !== null || !activeQuiz[quizIdx]) return
    setSelected(idx)
    const correct = idx === activeQuiz[quizIdx].answer
    if (correct) { setCorrectCount((c) => c + 1); setFocusScore((s) => Math.min(100, s + 5)) }
    else { setFocusScore((s) => Math.max(0, s - 8)) }
    setTotalAnswered((t) => t + 1)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (quizIdx < activeQuiz.length - 1) {
        setQuizIdx((i) => i + 1)
        setSelected(null)
      } else {
        setShowQuiz(false)
        setPlaying(true)
        videoRef.current?.play()
      }
    }, 1200)
  }

  const handleEnded = () => {
    setCompleted(true)
    setPlaying(false)
    if (videoRef.current) videoRef.current.pause()
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  if (authLoading || !user) return null
  if (!lesson) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-4">
        <p className="text-body-sm text-canvas-soft/50 mb-4">Lesson not found.</p>
        <Link href="/videos"><Button variant="primary" className="cursor-pointer">Back</Button></Link>
      </div>
    )
  }

  const xpGained = correctCount * 15 + focusScore

  return (
    <div className="min-h-screen bg-ink">
      <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/videos" className="flex items-center gap-2 text-caption font-bold uppercase tracking-wider" style={{ color: `${lesson.color}99` }}>
            <ArrowLeft className="w-4 h-4" /> All Videos
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-caption text-canvas-soft/30 uppercase tracking-wider">Focus</span>
            <span className="text-body-md-strong font-mono" style={{ color: focusScore > 70 ? lesson.color : "#d03238" }}>{focusScore}%</span>
          </div>
        </div>

        {/* Video + sidebar */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Video column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black border border-primary/5 aspect-video">
              <video ref={videoRef} src={lesson.videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration) }}
                onEnded={handleEnded}
                className="w-full h-full object-contain" playsInline preload="auto"
              />

              {!started && (
                <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: `${lesson.color}20` }}>
                    <Play className="w-8 h-8 ml-1" style={{ color: lesson.color }} />
                  </div>
                  <h2 className="text-display-xs text-canvas-soft mb-2">{lesson.title}</h2>
                  <p className="text-body-sm text-canvas-soft/40 mb-6 max-w-sm">Interactive quizzes will pop up at key moments. Stay focused!</p>
                  <Button variant="primary" onClick={() => { setStarted(true); setPlaying(true); videoRef.current?.play(); pregenerateAll() }} className="cursor-pointer">
                    Start Watching <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}

              {started && !completed && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 opacity-0 hover:opacity-100 transition-opacity">
                  <button onClick={() => { if (playing) { videoRef.current?.pause(); setPlaying(false) } else { videoRef.current?.play(); setPlaying(true) } }}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-ink mb-3">
                    {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(currentTime / Math.max(duration, 1)) * 100}%`, background: lesson.color }} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-caption font-bold uppercase tracking-wider" style={{ color: `${lesson.color}99` }}>{lesson.subject}</span>
              <span className="w-1 h-1 rounded-full bg-canvas-soft/10" />
              <span className="text-caption text-canvas-soft/30">{lesson.checkpoints.length} checkpoints</span>
            </div>
            <h1 className="text-display-xs text-canvas-soft">{lesson.title}</h1>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-surface-card border border-primary/5 p-5">
              <h3 className="text-body-md-strong text-canvas-soft flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4" style={{ color: lesson.color }} /> Progress
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-caption mb-1">
                    <span className="text-canvas-soft/40">Status</span>
                    <span style={{ color: lesson.color }}>{playing ? "Watching" : showQuiz ? "Quiz" : completed ? "Done" : "Paused"}</span>
                  </div>
                  <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${focusScore}%`, background: focusScore > 70 ? lesson.color : "#d03238" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-caption mb-1">
                    <span className="text-canvas-soft/40">Checkpoints</span>
                    <span className="text-canvas-soft/50">{checkpointCount}/{lesson.checkpoints.length}</span>
                  </div>
                  <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(checkpointCount / lesson.checkpoints.length) * 100}%`, background: lesson.color }} />
                  </div>
                </div>
                <div className="text-caption text-canvas-soft/40 leading-relaxed pt-2 border-t border-primary/5">
                  AI generates questions from the video transcript at each checkpoint.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Quiz Overlay ─── */}
        {showQuiz && (
          <div className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${lesson.color}20` }}>
                  <Timer className="w-6 h-6 animate-pulse" style={{ color: lesson.color }} />
                </div>
                <h2 className="text-display-xs text-canvas-soft">Checkpoint Quiz</h2>
                <p className="text-body-sm text-canvas-soft/40 mt-1">AI-generated from the video content.</p>
              </div>

              <div className="rounded-2xl bg-surface-card border border-primary/5 p-6 md:p-8">
                {activeQuiz.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-10 h-10 mx-auto mb-3 text-canvas-soft/20" />
                    <p className="text-body-sm text-canvas-soft/40 mb-4">No AI questions available. Add a <strong>GROQ_API_KEY</strong> to your .env to generate questions from the transcript.</p>
                    <button onClick={() => { setShowQuiz(false); setPlaying(true); videoRef.current?.play() }}
                      className="text-sm font-semibold text-primary hover:underline cursor-pointer">Continue watching</button>
                  </div>
                ) : !activeQuiz[quizIdx] ? (
                  <div className="text-center py-8">
                    <p className="text-body-sm text-canvas-soft/40 mb-4">Loading questions...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-caption text-canvas-soft/30 uppercase tracking-wider">Question {quizIdx + 1} of {activeQuiz.length}</span>
                      {selected !== null && (
                        <span className={`text-sm font-semibold ${selected === activeQuiz[quizIdx].answer ? "text-primary" : "text-negative"}`}>
                          {selected === activeQuiz[quizIdx].answer ? "✓ Correct" : "✗ Wrong"}
                        </span>
                      )}
                    </div>
                    <p className="text-body-md-strong text-canvas-soft mb-6">{activeQuiz[quizIdx].q}</p>
                    <div className="space-y-2">
                      {activeQuiz[quizIdx].options.map((opt, oi) => {
                        const correct = oi === activeQuiz[quizIdx].answer
                        const sel = selected === oi
                        let cls = "border-surface-elevated bg-ink text-canvas-soft/70"
                        if (sel && correct) cls = "border-primary bg-primary/10 text-primary"
                        else if (sel && !correct) cls = "border-negative/50 bg-negative/10 text-negative"
                        else if (selected !== null && correct) cls = "border-primary/30 bg-primary/5 text-primary/70"
                        return (
                          <button key={oi} disabled={selected !== null} onClick={() => handleSelect(oi)}
                            className={`w-full text-left rounded-xl border-2 px-5 py-4 text-body-md transition-all cursor-pointer ${cls}`}>
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold mr-3 ${selected !== null && correct ? "bg-primary text-on-primary" : sel ? "bg-primary/20 text-primary" : "bg-surface-elevated text-canvas-soft/40"}`}>
                              {String.fromCharCode(65 + oi)}
                            </span>
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Completion ─── */}
        {completed && (
          <div className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-2xl flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <Trophy className="w-20 h-20 mx-auto mb-4" style={{ color: lesson.color }} />
              <h2 className="text-display-sm text-canvas-soft mb-2">Video Complete!</h2>
              <p className="text-body-sm text-canvas-soft/40 mb-8">Great focus and comprehension.</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="rounded-xl bg-surface-card border border-primary/5 p-5">
                  <div className="text-display-xs font-black" style={{ color: lesson.color }}>{correctCount}/{totalAnswered}</div>
                  <div className="text-caption text-canvas-soft/30 uppercase tracking-wider mt-1">Correct</div>
                </div>
                <div className="rounded-xl bg-surface-card border border-primary/5 p-5">
                  <div className="text-display-xs font-black text-primary">+{xpGained}</div>
                  <div className="text-caption text-canvas-soft/30 uppercase tracking-wider mt-1">XP Gained</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/videos"><Button variant="secondary" className="bg-surface-elevated text-canvas-soft hover:bg-surface-card cursor-pointer">Back to Videos</Button></Link>
                <Link href={`/subject/${lesson.subjectId}`}><Button variant="primary" className="cursor-pointer">Explore {lesson.subject} <ChevronRight className="w-4 h-4 ml-1" /></Button></Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
