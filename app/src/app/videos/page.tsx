"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { Brain, Sparkles, Search, Filter } from "lucide-react"

const LESSONS = [
  {
    id: "l1",
    title: "Energy Transformation",
    subject: "Science",
    subjectId: "science",
    sections: 3,
    difficulty: "Medium",
    color: "#38c8ff",
  },
  {
    id: "l2",
    title: "Building Simple Circuits",
    subject: "Technology",
    subjectId: "technology",
    sections: 3,
    difficulty: "Easy",
    color: "#ff6b9d",
  },
  {
    id: "l3",
    title: "Water Filtration Ethics",
    subject: "Engineering",
    subjectId: "engineering",
    sections: 3,
    difficulty: "Hard",
    color: "#ffd11a",
  },
  {
    id: "l4",
    title: "Math in Nature",
    subject: "Mathematics",
    subjectId: "math",
    sections: 3,
    difficulty: "Easy",
    color: "#9fe870",
  },
]

export default function VideosPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")

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

  const subjects = ["All", ...new Set(LESSONS.map((l) => l.subject))]
  const filtered = LESSONS.filter(
    (l) =>
      (filter === "All" || l.subject === filter) &&
      (l.title.toLowerCase().includes(search.toLowerCase()) || l.subject.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-ink">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:py-14">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" />
            Learn While You Watch
          </div>
          <h1 className="text-display-sm md:text-display-md text-canvas-soft">
            Interactive <span className="text-primary">Videos</span>
          </h1>
          <p className="text-body-sm text-canvas-soft/40 max-w-xl mt-2">
            Watch lessons and answer checkpoint quizzes to test your understanding as you learn.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-canvas-soft/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lessons..."
              className="w-full bg-surface-card border border-primary/5 rounded-xl pl-11 pr-4 py-3 text-body-sm text-canvas-soft placeholder:text-canvas-soft/20 focus:outline-none focus:border-primary/30 transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filter === s
                    ? "bg-primary text-on-primary"
                    : "bg-surface-card border border-primary/5 text-canvas-soft/50 hover:text-canvas-soft hover:border-primary/20"
                }`}
              >
                {s === "All" ? <Filter className="w-4 h-4 inline mr-1.5" /> : null}
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Lesson Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-body-sm text-canvas-soft/30">No lessons match your search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((lesson) => (
              <Link key={lesson.id} href={`/video/${lesson.id}`} className="group block">
                <div className="relative rounded-2xl bg-surface-card border border-primary/5 overflow-hidden transition-all duration-300 hover:border-[var(--color)]/30 hover:-translate-y-1"
                  style={{ "--color": lesson.color } as React.CSSProperties}
                >
                  {/* Header graphic */}
                  <div className="aspect-[2/1] bg-gradient-to-br flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${lesson.color}20, ${lesson.color}05)` }}
                  >
                    <Brain className="w-12 h-12" style={{ color: `${lesson.color}60` }} />
                  </div>

                  <div className="p-5">
                    <span className="text-caption font-semibold uppercase tracking-wider" style={{ color: `${lesson.color}99` }}>
                      {lesson.subject}
                    </span>
                    <h3 className="text-body-md-strong text-canvas-soft mt-1 group-hover:text-[var(--color)] transition-colors">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-3 text-caption text-canvas-soft/30">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI-powered quizzes
                      </span>
                      <span>{lesson.sections} sections</span>
                      <span>{lesson.difficulty}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
