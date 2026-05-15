"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { BookOpen, ChevronRight, ArrowLeft, Trophy, RotateCw, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateRating } from "@/lib/battle"

interface FlashCard {
  q: string
  a: string
  topic: string
}

const SUBJECTS = [
  { id: "Science", icon: "🔬", color: "#38c8ff" },
  { id: "Technology", icon: "💻", color: "#ff6b9d" },
  { id: "Engineering", icon: "⚙️", color: "#ffd11a" },
  { id: "Mathematics", icon: "📐", color: "#9fe870" },
]

const DECKS: Record<string, FlashCard[]> = {
  Science: [
    { q: "What is the chemical symbol for gold?", a: "Au (from Latin 'aurum')", topic: "Chemistry" },
    { q: "What planet is closest to the Sun?", a: "Mercury", topic: "Astronomy" },
    { q: "What gas do plants release during photosynthesis?", a: "Oxygen", topic: "Biology" },
    { q: "What is the pH of pure water?", a: "7 (neutral)", topic: "Chemistry" },
    { q: "What force keeps planets in orbit?", a: "Gravity", topic: "Physics" },
    { q: "What is the smallest unit of life?", a: "The cell", topic: "Biology" },
    { q: "What type of rock forms from cooled magma?", a: "Igneous rock", topic: "Geology" },
    { q: "What is the speed of sound at sea level?", a: "343 meters per second", topic: "Physics" },
    { q: "What element is most abundant in Earth's atmosphere?", a: "Nitrogen (78%)", topic: "Chemistry" },
    { q: "What organ pumps blood through the body?", a: "The heart", topic: "Biology" },
  ],
  Technology: [
    { q: "What does CPU stand for?", a: "Central Processing Unit", topic: "Hardware" },
    { q: "What does HTML stand for?", a: "HyperText Markup Language", topic: "Web" },
    { q: "What is a variable in programming?", a: "A storage location for data that can change", topic: "Programming" },
    { q: "What does IP stand for?", a: "Internet Protocol", topic: "Networking" },
    { q: "What is a loop used for?", a: "Repeating a block of code", topic: "Programming" },
    { q: "What is the cloud in computing?", a: "Remote servers accessed via the internet", topic: "Cloud" },
    { q: "What does RAM stand for?", a: "Random Access Memory", topic: "Hardware" },
    { q: "What is a function in code?", a: "A reusable block of code that performs a task", topic: "Programming" },
    { q: "What protects a network from unauthorized access?", a: "A firewall", topic: "Security" },
    { q: "What does SQL stand for?", a: "Structured Query Language", topic: "Databases" },
  ],
  Engineering: [
    { q: "What two main forces must bridges resist?", a: "Tension (pulling) and compression (pushing)", topic: "Structures" },
    { q: "What simple machine is a ramp?", a: "An inclined plane", topic: "Mechanics" },
    { q: "What does Ohm's Law state?", a: "V = IR (Voltage = Current x Resistance)", topic: "Electronics" },
    { q: "What type of circuit has multiple paths?", a: "Parallel circuit", topic: "Electronics" },
    { q: "What is the main alloy in steel?", a: "Iron and carbon", topic: "Materials" },
    { q: "What is a cantilever?", a: "A beam fixed at only one end", topic: "Structures" },
    { q: "What does CAD stand for?", a: "Computer-Aided Design", topic: "Design" },
    { q: "What is torque?", a: "Rotational force", topic: "Mechanics" },
    { q: "What material is known for shape memory?", a: "Nitinol (nickel-titanium)", topic: "Materials" },
    { q: "What is the purpose of a flywheel?", a: "To store rotational kinetic energy", topic: "Mechanics" },
  ],
  Mathematics: [
    { q: "What is the square root of 144?", a: "12", topic: "Arithmetic" },
    { q: "What is the value of pi to 2 decimal places?", a: "3.14", topic: "Geometry" },
    { q: "What is the formula for area of a circle?", a: "A = πr²", topic: "Geometry" },
    { q: "What is 15% of 200?", a: "30", topic: "Arithmetic" },
    { q: "What is the next prime number after 7?", a: "11", topic: "Number Theory" },
    { q: "What is the slope-intercept form of a line?", a: "y = mx + b", topic: "Algebra" },
    { q: "How many degrees in a triangle?", a: "180 degrees", topic: "Geometry" },
    { q: "What is 2 to the power of 5?", a: "32", topic: "Arithmetic" },
    { q: "What is the median of 3, 7, 9, 12, 15?", a: "9", topic: "Statistics" },
    { q: "What is a logarithm?", a: "The inverse of exponentiation", topic: "Algebra" },
  ],
}

export default function FlashcardsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [subject, setSubject] = useState<string | null>(null)
  const [cards, setCards] = useState<FlashCard[]>([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) router.replace("/login")
  }, [user, authLoading, router])

  const startDeck = (subj: string) => {
    const deck = [...DECKS[subj]].sort(() => Math.random() - 0.5)
    setSubject(subj)
    setCards(deck)
    setIdx(0)
    setFlipped(false)
    setKnown(0)
    setDone(false)
  }

  const markKnown = () => {
    if (idx < cards.length - 1) {
      setKnown((k) => k + 1)
      setIdx((i) => i + 1)
      setFlipped(false)
    } else {
      const total = known + 1
      setKnown(total)
      setDone(true)
      const pct = Math.round((total / cards.length) * 100)
      const delta = pct >= 90 ? 15 : pct >= 70 ? 8 : pct >= 50 ? 2 : -5
      if (user) updateRating(user.uid, "flashcards", delta)
    }
  }

  const markUnknown = () => {
    if (idx < cards.length - 1) {
      setIdx((i) => i + 1)
      setFlipped(false)
    } else {
      setDone(true)
      const pct = Math.round((known / cards.length) * 100)
      const delta = pct >= 90 ? 15 : pct >= 70 ? 8 : pct >= 50 ? 2 : -5
      if (user) updateRating(user.uid, "flashcards", delta)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // ── Subject Selection ──
  if (!subject) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12">
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="relative text-center max-w-4xl">
          <Link href="/games" className="inline-flex items-center gap-1 text-caption font-semibold text-canvas-soft/40 hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-3 h-3" /> Game Zone
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-canvas-soft mb-2">Flash Cards</h1>
          <p className="text-body-sm text-canvas-soft/40 mb-10 max-w-md mx-auto">Pick a subject and flip through Q&A flashcards.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUBJECTS.map((sub) => (
              <button key={sub.id} onClick={() => startDeck(sub.id)}
                className="group rounded-2xl bg-surface-card border border-primary/5 p-6 text-center transition-all duration-300 hover:border-[var(--color)]/30 hover:-translate-y-1 cursor-pointer"
                style={{ "--color": sub.color } as React.CSSProperties}>
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{sub.icon}</span>
                <h3 className="text-body-md-strong text-canvas-soft group-hover:text-[var(--color)] transition-colors">{sub.id}</h3>
                <p className="text-caption text-canvas-soft/30 mt-1">10 cards</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Results ──
  if (done) {
    const pct = Math.round((known / cards.length) * 100)
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12">
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="relative max-w-lg w-full bg-surface-card rounded-2xl border border-primary/5 p-8 md:p-10 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-display-sm text-canvas-soft mb-2">Deck Complete!</h2>
          <p className="text-body-sm text-canvas-soft/40 mb-8">{subject} session finished.</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl bg-surface-elevated border border-primary/5 p-4">
              <p className="text-display-xs text-primary font-black">{known}</p>
              <p className="text-caption text-canvas-soft/30 uppercase mt-1">Known</p>
            </div>
            <div className="rounded-xl bg-surface-elevated border border-primary/5 p-4">
              <p className="text-display-xs text-negative font-black">{cards.length - known}</p>
              <p className="text-caption text-canvas-soft/30 uppercase mt-1">Review</p>
            </div>
            <div className="rounded-xl bg-surface-elevated border border-primary/5 p-4">
              <p className="text-display-xs text-primary font-black">{pct}%</p>
              <p className="text-caption text-canvas-soft/30 uppercase mt-1">Accuracy</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="secondary" onClick={() => startDeck(subject)} className="bg-surface-elevated text-canvas-soft hover:bg-surface-card cursor-pointer">
              <RotateCw className="w-4 h-4 mr-1.5" /> Retry Deck
            </Button>
            <Button variant="primary" onClick={() => setSubject(null)} className="cursor-pointer">
              New Subject <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Flashcard ──
  const card = cards[idx]
  const subjectColor = SUBJECTS.find((s) => s.id === subject)?.color || "#9fe870"

  return (
    <div className="min-h-screen bg-ink">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-2xl px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSubject(null)} className="flex items-center gap-2 text-caption font-bold uppercase tracking-wider text-canvas-soft/40 hover:text-primary transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Subjects
          </button>
          <div className="text-right">
            <span className="text-caption text-canvas-soft/30 uppercase tracking-wider">{subject}</span>
            <p className="text-sm font-bold text-primary">{idx + 1}/{cards.length}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden mb-6">
          <div className="h-full rounded-full transition-all" style={{ width: `${(idx / cards.length) * 100}%`, background: subjectColor }} />
        </div>

        {/* Card */}
        <div className="perspective-1000 mb-6" style={{ perspective: "1000px" }}>
          <div
            className="relative transition-all duration-500 cursor-pointer"
            style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: "400px" }}
            onClick={() => !flipped && setFlipped(true)}
          >
            {/* Front */}
            <div className="absolute inset-0 rounded-2xl bg-surface-card border border-primary/5 p-8 md:p-10 flex flex-col items-center justify-center text-center"
              style={{ backfaceVisibility: "hidden" }}>
              <span className="text-caption font-semibold uppercase tracking-wider mb-4" style={{ color: `${subjectColor}99` }}>{card.topic}</span>
              <EyeOff className="w-6 h-6 mb-4" style={{ color: `${subjectColor}60` }} />
              <p className="text-display-xs text-canvas-soft leading-snug mb-6">{card.q}</p>
              <span className="text-caption text-canvas-soft/20">Tap to reveal answer</span>
            </div>

            {/* Back */}
            <div className="absolute inset-0 rounded-2xl bg-surface-card border-2 flex flex-col items-center justify-center text-center p-8 md:p-10"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderColor: `${subjectColor}40` }}>
              <span className="text-caption font-semibold uppercase tracking-wider mb-4 text-primary">Answer</span>
              <Eye className="w-6 h-6 mb-4 text-primary" />
              <p className="text-display-xs text-canvas-soft leading-snug mb-4">{card.a}</p>
              <span className="text-caption text-canvas-soft/20">{card.topic}</span>
            </div>
          </div>
        </div>

        {/* Action buttons (only visible after flip) */}
        {flipped && (
          <div className="flex gap-3 justify-center">
            <button
              onClick={markUnknown}
              className="flex-1 max-w-[200px] rounded-xl border-2 border-negative/30 py-4 text-negative font-bold text-sm hover:bg-negative/10 transition-all cursor-pointer"
            >
              Still Learning
            </button>
            <button
              onClick={markKnown}
              className="flex-1 max-w-[200px] rounded-xl border-2 border-primary/30 py-4 text-primary font-bold text-sm hover:bg-primary/10 transition-all cursor-pointer"
            >
              Got It
            </button>
          </div>
        )}
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  )
}
