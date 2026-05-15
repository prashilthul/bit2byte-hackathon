"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { BookOpen, ChevronRight, ArrowLeft, Trophy, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateRating } from "@/lib/battle"

interface FlashCard {
  q: string
  options: string[]
  answer: number
  topic: string
  explanation: string
}

const SUBJECTS = [
  { id: "Science", icon: "🔬", color: "#38c8ff" },
  { id: "Technology", icon: "💻", color: "#ff6b9d" },
  { id: "Engineering", icon: "⚙️", color: "#ffd11a" },
  { id: "Mathematics", icon: "📐", color: "#9fe870" },
]

const DECKS: Record<string, FlashCard[]> = {
  Science: [
    { q: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2, topic: "Chemistry", explanation: "Au comes from the Latin word 'aurum' meaning gold." },
    { q: "What planet is closest to the Sun?", options: ["Venus", "Mercury", "Earth", "Mars"], answer: 1, topic: "Astronomy", explanation: "Mercury orbits at an average distance of 58 million km from the Sun." },
    { q: "What gas do plants release during photosynthesis?", options: ["CO₂", "Oxygen", "Nitrogen", "Hydrogen"], answer: 1, topic: "Biology", explanation: "Plants release oxygen as a byproduct of photosynthesis." },
    { q: "What is the pH of pure water?", options: ["5", "7", "9", "3"], answer: 1, topic: "Chemistry", explanation: "Pure water has a neutral pH of 7." },
    { q: "What force keeps planets in orbit?", options: ["Magnetism", "Friction", "Gravity", "Nuclear"], answer: 2, topic: "Physics", explanation: "Gravity is the attractive force between all objects with mass." },
    { q: "What is the smallest unit of life?", options: ["Atom", "Cell", "Molecule", "Tissue"], answer: 1, topic: "Biology", explanation: "The cell is the basic structural and functional unit of all living organisms." },
    { q: "What type of rock forms from cooled magma?", options: ["Sedimentary", "Metamorphic", "Igneous", "Fossil"], answer: 2, topic: "Geology", explanation: "Igneous rocks form when magma or lava cools and solidifies." },
    { q: "What is the speed of sound at sea level?", options: ["343 m/s", "700 m/s", "150 m/s", "1000 m/s"], answer: 0, topic: "Physics", explanation: "Sound travels at approximately 343 meters per second at sea level." },
    { q: "What element is most abundant in Earth's atmosphere?", options: ["Oxygen", "CO₂", "Nitrogen", "Argon"], answer: 2, topic: "Chemistry", explanation: "Nitrogen makes up about 78% of Earth's atmosphere." },
    { q: "What organ pumps blood through the body?", options: ["Lungs", "Brain", "Heart", "Liver"], answer: 2, topic: "Biology", explanation: "The heart is a muscular organ that pumps blood through the circulatory system." },
  ],
  Technology: [
    { q: "What does CPU stand for?", options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Core Process Unit"], answer: 1, topic: "Hardware", explanation: "The CPU is the brain of the computer that processes instructions." },
    { q: "What does HTML stand for?", options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "HyperTransfer Markup Language"], answer: 0, topic: "Web", explanation: "HTML is the standard markup language for creating web pages." },
    { q: "What is a variable in programming?", options: ["A fixed value", "A storage location", "A loop", "A function"], answer: 1, topic: "Programming", explanation: "A variable stores data that can be changed during program execution." },
    { q: "What does IP stand for?", options: ["Internet Protocol", "Internal Program", "Integrated Processor", "Interface Port"], answer: 0, topic: "Networking", explanation: "IP is the principal communication protocol for relaying data across networks." },
    { q: "What is a loop used for?", options: ["Making decisions", "Repeating code", "Storing data", "Defining functions"], answer: 1, topic: "Programming", explanation: "Loops execute a block of code repeatedly until a condition is met." },
    { q: "What is the cloud in computing?", options: ["Weather data", "Remote servers accessed via internet", "Local storage", "A type of software"], answer: 1, topic: "Cloud", explanation: "The cloud refers to servers accessed over the internet for storage and computing." },
    { q: "What does RAM stand for?", options: ["Read Access Memory", "Random Access Memory", "Rapid Access Module", "Run Application Mode"], answer: 1, topic: "Hardware", explanation: "RAM is the computer's temporary memory used for active tasks." },
    { q: "What is a function in code?", options: ["A variable", "A reusable block of code", "A data type", "A loop"], answer: 1, topic: "Programming", explanation: "Functions are reusable blocks of code that perform specific tasks." },
    { q: "What protects a network from unauthorized access?", options: ["VPN", "Firewall", "Browser", "Router"], answer: 1, topic: "Security", explanation: "A firewall monitors and controls incoming and outgoing network traffic." },
    { q: "What does SQL stand for?", options: ["Simple Query Language", "Structured Query Language", "Sequential Query Logic", "System Query Layer"], answer: 1, topic: "Databases", explanation: "SQL is used to manage and query relational databases." },
  ],
  Engineering: [
    { q: "What is the main force bridges must resist?", options: ["Tension and compression", "Only tension", "Only compression", "Friction"], answer: 0, topic: "Structures", explanation: "Bridges must handle both tension (pulling) and compression (pushing) forces." },
    { q: "What simple machine is a ramp?", options: ["Lever", "Pulley", "Inclined plane", "Wedge"], answer: 2, topic: "Mechanics", explanation: "An inclined plane reduces the force needed to lift an object." },
    { q: "What does Ohm's Law state?", options: ["V = IR", "F = ma", "E = mc²", "PV = nRT"], answer: 0, topic: "Electronics", explanation: "Ohm's Law: Voltage = Current × Resistance." },
    { q: "What type of circuit has multiple paths?", options: ["Series", "Parallel", "Short", "Open"], answer: 1, topic: "Electronics", explanation: "In parallel circuits, each component has its own path for current." },
    { q: "What is the main alloy in steel?", options: ["Iron and carbon", "Copper and tin", "Aluminum and zinc", "Nickel and chrome"], answer: 0, topic: "Materials", explanation: "Steel is primarily iron with 0.2-2.1% carbon." },
    { q: "What is a cantilever?", options: ["A type of engine", "A beam fixed at one end", "A type of bridge only", "A measurement tool"], answer: 1, topic: "Structures", explanation: "A cantilever is a rigid beam anchored at only one end." },
    { q: "What does CAD stand for?", options: ["Computer Automated Design", "Computer-Aided Design", "Central Assembly Drawing", "Code and Design"], answer: 1, topic: "Design", explanation: "CAD software is used to create precision drawings and 3D models." },
    { q: "What is torque?", options: ["Rotational force", "Linear speed", "Electrical current", "Heat energy"], answer: 0, topic: "Mechanics", explanation: "Torque is the rotational equivalent of linear force." },
    { q: "What material is known for shape memory?", options: ["Steel", "Nitinol", "Copper", "Aluminum"], answer: 1, topic: "Materials", explanation: "Nitinol (nickel-titanium) returns to its original shape when heated." },
    { q: "What is the purpose of a flywheel?", options: ["Store rotational energy", "Increase speed", "Reduce friction", "Generate electricity"], answer: 0, topic: "Mechanics", explanation: "Flywheels store kinetic energy by maintaining rotational momentum." },
  ],
  Mathematics: [
    { q: "What is the square root of 144?", options: ["10", "11", "12", "13"], answer: 2, topic: "Arithmetic", explanation: "12 × 12 = 144, so the square root is 12." },
    { q: "What is the value of π to 2 decimal places?", options: ["2.14", "3.14", "4.14", "1.14"], answer: 1, topic: "Geometry", explanation: "Pi is approximately 3.14159..., rounded to 3.14." },
    { q: "What is the formula for area of a circle?", options: ["πr", "2πr", "πr²", "πr³"], answer: 2, topic: "Geometry", explanation: "Area of a circle = π × radius²." },
    { q: "What is 15% of 200?", options: ["15", "20", "25", "30"], answer: 3, topic: "Arithmetic", explanation: "15% of 200 = 0.15 × 200 = 30." },
    { q: "What is the next prime number after 7?", options: ["8", "9", "10", "11"], answer: 3, topic: "Number Theory", explanation: "11 is prime (divisible only by 1 and itself)." },
    { q: "What is the slope-intercept form of a line?", options: ["y = mx + b", "y = ax² + c", "x + y = c", "y = 1/x"], answer: 0, topic: "Algebra", explanation: "y = mx + b where m is slope and b is the y-intercept." },
    { q: "How many degrees in a triangle?", options: ["90°", "180°", "270°", "360°"], answer: 1, topic: "Geometry", explanation: "The sum of interior angles of any triangle is 180°." },
    { q: "What is 2⁵?", options: ["16", "32", "64", "128"], answer: 1, topic: "Arithmetic", explanation: "2⁵ = 2 × 2 × 2 × 2 × 2 = 32." },
    { q: "What is the median of 3, 7, 9, 12, 15?", options: ["7", "9", "12", "3"], answer: 1, topic: "Statistics", explanation: "The median is the middle value: 9." },
    { q: "What is a logarithm?", options: ["The inverse of exponentiation", "A type of fraction", "A geometric shape", "A type of graph"], answer: 0, topic: "Algebra", explanation: "A logarithm is the inverse operation to exponentiation." },
  ],
}

export default function FlashcardsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [subject, setSubject] = useState<string | null>(null)
  const [cards, setCards] = useState<FlashCard[]>([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) router.replace("/login")
  }, [user, authLoading, router])

  const startDeck = (subj: string) => {
    const deck = [...DECKS[subj]].sort(() => Math.random() - 0.5)
    setSubject(subj)
    setCards(deck)
    setIdx(0)
    setSelected(null)
    setFlipped(false)
    setResults([])
    setComplete(false)
  }

  const handleSelect = (optIdx: number) => {
    if (selected !== null) return
    setSelected(optIdx)
    const correct = optIdx === cards[idx].answer
    setResults((prev) => [...prev, correct])
    setTimeout(() => setFlipped(true), 800)
  }

  const correctCount = results.filter(Boolean).length

  const handleNext = () => {
    if (idx < cards.length - 1) {
      setIdx((i) => i + 1)
      setSelected(null)
      setFlipped(false)
    } else {
      setComplete(true)
      const pct = Math.round((correctCount / cards.length) * 100)
      const delta = pct >= 90 ? 15 : pct >= 70 ? 8 : pct >= 50 ? 2 : -5
      updateRating(user!.uid, "flashcards", delta)
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
          <p className="text-body-sm text-canvas-soft/40 mb-10 max-w-md mx-auto">Pick a subject and flip through STEM flashcards.</p>
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
  if (complete) {
    const pct = Math.round((correctCount / cards.length) * 100)
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12">
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="relative max-w-lg w-full bg-surface-card rounded-2xl border border-primary/5 p-8 md:p-10 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-display-sm text-canvas-soft mb-2">Deck Complete!</h2>
          <p className="text-body-sm text-canvas-soft/40 mb-8">{subject} flashcard session finished.</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl bg-surface-elevated border border-primary/5 p-4">
              <p className="text-display-xs text-primary font-black">{correctCount}</p>
              <p className="text-caption text-canvas-soft/30 uppercase mt-1">Correct</p>
            </div>
            <div className="rounded-xl bg-surface-elevated border border-primary/5 p-4">
              <p className="text-display-xs text-negative font-black">{cards.length - correctCount}</p>
              <p className="text-caption text-canvas-soft/30 uppercase mt-1">Wrong</p>
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
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSubject(null)} className="flex items-center gap-2 text-caption font-bold uppercase tracking-wider text-canvas-soft/40 hover:text-primary transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Subjects
          </button>
          <div className="text-right">
            <span className="text-caption text-canvas-soft/30 uppercase tracking-wider">{subject}</span>
            <p className="text-sm font-bold text-primary">{results.length}/{cards.length}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden mb-8">
          <div className="h-full rounded-full transition-all" style={{ width: `${(results.length / cards.length) * 100}%`, background: subjectColor }} />
        </div>

        {/* Card */}
        <div className="perspective-1000" style={{ perspective: "1000px" }}>
          <div
            className="relative transition-all duration-700"
            style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            {/* Front */}
            <div className="rounded-2xl bg-surface-card border border-primary/5 p-6 md:p-8" style={{ backfaceVisibility: "hidden" }}>
              <span className="text-caption font-semibold uppercase tracking-wider" style={{ color: `${subjectColor}99` }}>{card.topic}</span>
              <h2 className="text-display-xs text-canvas-soft mt-2 mb-6">{card.q}</h2>
              <div className="space-y-3">
                {card.options.map((opt, oi) => {
                  const isSelected = selected === oi
                  const isCorrect = oi === card.answer
                  let cls = "border-surface-elevated bg-ink text-canvas-soft/70"
                  if (flipped && isCorrect) cls = "border-primary bg-primary/10 text-primary"
                  else if (isSelected && !flipped) cls = "border-primary/50 bg-primary/5 text-canvas-soft"
                  else if (flipped && isSelected && !isCorrect) cls = "border-negative/50 bg-negative/10 text-negative"
                  return (
                    <button key={oi} disabled={selected !== null} onClick={() => handleSelect(oi)}
                      className={`w-full text-left rounded-xl border-2 px-5 py-4 text-body-md transition-all cursor-pointer ${cls}`}>
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mr-3 ${
                        flipped && isCorrect ? "bg-primary text-on-primary" :
                        isSelected ? "bg-primary/20 text-primary" : "bg-surface-elevated text-canvas-soft/40"
                      }`}>{String.fromCharCode(65 + oi)}</span>
                      {opt}
                    </button>
                  )
                })}
              </div>

              {!flipped && selected !== null && (
                <p className="text-center text-caption text-canvas-soft/30 mt-4">Flipping to show answer...</p>
              )}
            </div>

            {/* Back */}
            {flipped && (
              <div className="absolute inset-0 rounded-2xl bg-surface-card border border-primary/20 p-6 md:p-8 flex flex-col"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <span className="text-caption font-semibold uppercase tracking-wider text-primary mb-4">Explanation</span>
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 mb-4">
                  <p className="text-caption text-primary/70 uppercase tracking-wider mb-1">Answer</p>
                  <p className="text-body-md-strong text-primary">{card.options[card.answer]}</p>
                </div>
                <p className="text-body-md text-canvas-soft/60 leading-relaxed flex-1">{card.explanation}</p>
                <div className="mt-6 flex justify-end">
                  <Button variant="primary" size="sm" onClick={handleNext} className="cursor-pointer">
                    {idx < cards.length - 1 ? "Next Card" : "See Results"} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  )
}
