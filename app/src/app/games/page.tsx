"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { Swords, Sparkles, ChevronRight, Gamepad2, BookOpen } from "lucide-react"

const GAMES = [
  {
    id: "battle",
    title: "Battle Arena",
    description: "Real-time 1v1 quiz battle. Create a room, invite friends, and answer questions faster than your opponent to climb the ratings.",
    icon: Swords,
    color: "#ff6b9d",
    players: "2+ players",
    href: "/games/battle",
  },
  {
    id: "flashcards",
    title: "Flash Cards",
    description: "Flip through STEM flashcards. Choose a subject, test your knowledge, and track your accuracy across decks.",
    icon: BookOpen,
    color: "#9fe870",
    players: "Solo practice",
    href: "/games/flashcards",
  },
]

export default function GamesHubPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!user) router.replace("/login")
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#ff6b9d]/5 blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-14">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Gamepad2 className="w-3 h-3" /> Game Zone
          </div>
          <h1 className="text-display-sm md:text-display-md text-canvas-soft">
            Choose Your <span className="text-primary">Game</span>
          </h1>
          <p className="text-body-sm text-canvas-soft/40 max-w-xl mt-2">
            Compete, learn, and earn rating points. More games coming soon.
          </p>
        </div>

        {/* Games grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game) => {
            const Icon = game.icon
            return (
              <Link
                key={game.id}
                href={game.href}
                className="group block rounded-2xl bg-surface-card border border-primary/5 p-6 md:p-8 transition-all duration-300 hover:border-[var(--color)]/30 hover:-translate-y-1 hover:shadow-lg"
                style={{ "--color": game.color } as React.CSSProperties}
              >
                <div
                  className="w-14 h-14 rounded-2xl border flex items-center justify-center mb-5"
                  style={{ background: `${game.color}15`, borderColor: `${game.color}30`, color: game.color }}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h2 className="text-display-xs text-canvas-soft group-hover:text-[var(--color)] transition-colors mb-2">
                  {game.title}
                </h2>
                <p className="text-body-sm text-canvas-soft/40 leading-relaxed mb-4">
                  {game.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-caption font-semibold uppercase tracking-wider" style={{ color: `${game.color}80` }}>
                    {game.players}
                  </span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: game.color }} />
                </div>
              </Link>
            )
          })}

          {/* Coming soon placeholder */}
          <div className="rounded-2xl border-2 border-dashed border-primary/10 p-6 md:p-8 flex flex-col items-center justify-center text-center opacity-50">
            <Sparkles className="w-8 h-8 text-canvas-soft/20 mb-3" />
            <p className="text-body-md-strong text-canvas-soft/30">More Games Coming</p>
            <p className="text-caption text-canvas-soft/20 mt-1">Quiz race, trivia, and more</p>
          </div>
        </div>
      </div>
    </div>
  )
}
