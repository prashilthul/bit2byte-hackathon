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
    <div className="min-h-screen bg-ink text-canvas-soft">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-white/5">
        <div
          className="h-full bg-primary shadow-[0_0_15px_rgba(159,232,112,0.5)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 md:py-20">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href={`/subject/${material.subjectId}`}
                className="group flex items-center gap-2 text-caption font-bold text-primary/60 hover:text-primary transition-colors uppercase tracking-[0.2em]"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                {material.subjectId}
              </Link>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span className="text-caption font-bold text-white/30 uppercase tracking-[0.2em]">
                Grade {material.grade}
              </span>
            </div>
            <h1 className="text-display-sm md:text-display-md text-white font-black leading-tight tracking-tightest pb-3 md:pb-4">
              {material.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNoteOpen(!noteOpen)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-bold transition-all cursor-pointer ${
                noteOpen
                  ? "bg-primary text-ink border-primary shadow-[0_0_20px_rgba(159,232,112,0.3)]"
                  : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20"
              }`}
            >
              <Pencil className="w-4 h-4" />
              {noteOpen ? "Hide Notes" : "Take Notes"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer font-bold text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        {/* Reading area + Notes panel */}
        <div className="flex flex-col md:flex-row gap-12 relative">
          {/* Main content */}
          <div
            ref={contentRef}
            className={`flex-1 min-w-0 transition-all duration-500 ${
              noteOpen ? "md:max-w-[calc(100%-400px)]" : "max-w-full"
            }`}
          >
            <div className="prose prose-invert max-w-none">
              <div className="reading-content-container pb-24">
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
