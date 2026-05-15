"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { getMaterialById } from "@/lib/firestore"
import LatexRenderer from "@/components/LatexRenderer"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  Pencil,
  X,
  Save,
  Download,
} from "lucide-react"
import { useToast } from "@/context/ToastContext"

interface Material {
  id: string
  title: string
  content: string
  subjectId: string
  grade: number
}

export default function MaterialPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [noteSaved, setNoteSaved] = useState(false)
  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace("/login")
      return
    }

    // Load note from localStorage
    const loadNote = (materialId: string) => {
      try {
        const key = `bit2byte_material_note_${materialId}`
        const saved = localStorage.getItem(key)
        if (saved) setNoteText(saved)
      } catch {}
    }

    const fetchMaterial = async () => {
      try {
        setLoading(true)
        const data = await getMaterialById(id)
        if (data) {
          setMaterial(data as Material)
          loadNote(id)
        } else {
          setError("Material not found.")
        }
      } catch {
        setError("Failed to load material.")
        toast("Failed to load material.", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchMaterial()
  }, [id, user, authLoading, router, toast])

  // Reading progress
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const total = el.scrollHeight - rect.height
      if (total <= 0) return
      const current = Math.abs(rect.top)
      setProgress(Math.min(100, Math.round((current / total) * 100)))
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [material])

  // Auto-save note to localStorage
  const handleNoteChange = (val: string) => {
    setNoteText(val)
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current)
    noteTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`bit2byte_material_note_${id}`, val)
        setNoteSaved(true)
        setTimeout(() => setNoteSaved(false), 2000)
      } catch {}
    }, 500)
  }

  const handleDownload = () => {
    window.print()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-body-sm text-canvas-soft/50">Loading material...</p>
        </div>
      </div>
    )
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-surface-card rounded-xl p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-canvas-soft/30" />
          <h2 className="text-display-xs text-canvas-soft mb-2">Not found</h2>
          <p className="text-body-sm text-canvas-soft/50 mb-6">
            {error || "This material doesn't exist."}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex rounded-xl bg-primary text-on-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary-active transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-surface-elevated">
        <div
          className="h-full bg-primary transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        {/* Top bar */}
        <div className="flex items-start justify-between mb-6 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href={`/subject/${material.subjectId}`}
              className="shrink-0 w-9 h-9 rounded-xl bg-surface-card border border-primary/5 flex items-center justify-center text-canvas-soft/50 hover:text-primary hover:border-primary/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <span className="text-caption text-primary/60 font-semibold uppercase tracking-wider">
                {material.subjectId}
              </span>
              <h1 className="text-body-md-strong md:text-display-sm text-canvas-soft leading-tight mt-0.5 truncate">
                {material.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setNoteOpen(!noteOpen)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                noteOpen
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-surface-card border-primary/5 text-canvas-soft/40 hover:text-primary hover:border-primary/20"
              }`}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="w-9 h-9 rounded-xl bg-surface-card border border-primary/5 flex items-center justify-center text-canvas-soft/40 hover:text-primary hover:border-primary/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reading area + Notes panel */}
        <div className="flex gap-6">
          {/* Main content */}
          <div
            ref={contentRef}
            className={`flex-1 min-w-0 transition-all duration-300 ${
              noteOpen ? "hidden md:block md:max-w-[calc(100%-320px)]" : "block max-w-full"
            }`}
          >
            <div className="rounded-2xl bg-surface-card border border-primary/5 p-5 md:p-10 print:shadow-none print:border-0">
              <div className="max-w-none text-canvas-soft/80 leading-relaxed reading-content">
                <LatexRenderer content={material.content} />
              </div>
            </div>
          </div>

          {/* Notes panel - full screen on mobile, sidebar on desktop */}
          <div
            className={`transition-all duration-300 ${
              noteOpen
                ? "fixed inset-0 z-50 md:relative md:inset-auto md:w-80 md:opacity-100"
                : "hidden md:block md:w-0 md:opacity-0 md:overflow-hidden"
            }`}
          >
            <div className="h-full md:sticky md:top-24 rounded-none md:rounded-2xl bg-surface-card md:border md:border-primary/5 p-5 md:h-[calc(100vh-10rem)] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-primary" />
                  <h3 className="text-body-md-strong text-canvas-soft">
                    Your Notes
                  </h3>
                </div>
                <button
                  onClick={() => setNoteOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-canvas-soft/50 hover:text-canvas-soft hover:bg-surface-elevated transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={noteText}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="Write your notes about this material..."
                className="flex-1 w-full bg-ink rounded-xl border border-primary/5 p-4 text-body-sm text-canvas-soft/70 placeholder:text-canvas-soft/20 resize-none outline-none focus:border-primary/20 transition-colors"
              />

              <div className="flex items-center gap-1.5 mt-3 text-caption text-canvas-soft/20">
                <Save className="w-3 h-3" />
                {noteSaved ? "Saved" : "Auto-saves as you type"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
