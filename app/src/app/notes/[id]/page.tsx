/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import {
  getNote,
  saveNoteLocally,
  syncNoteToFirestore,
  type Note,
} from "@/lib/sync"
import Link from "next/link"
import { ArrowLeft, Save, Trash2 } from "lucide-react"

export default function NoteEditorPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (loadedRef.current) return
    loadedRef.current = true

    const n = getNote(id)
    if (n) {
      setNote(n)
      setTitle(n.title)
      setContent(n.content)
    } else {
      router.replace("/notes")
    }
  }, [id, user, authLoading, router])

  // Auto-save with debounce
  useEffect(() => {
    if (!note) return
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      const updated: Note = {
        ...note,
        title,
        content,
        updatedAt: Date.now(),
      }
      saveNoteLocally(updated)
      setNote(updated)
      setSaving(true)

      if (user) {
        syncNoteToFirestore(user.uid, updated).then(() => {
          setSaving(false)
          setLastSaved(new Date())
        })
      } else {
        setSaving(false)
        setLastSaved(new Date())
      }
    }, 600)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [title, content, note, user])

  const handleDelete = async () => {
    if (!note) return
    if (!confirm(`Delete "${title || "Untitled"}"?`)) return
    const { deleteNoteLocally, deleteNoteFromFirestore } = await import("@/lib/sync")
    deleteNoteLocally(note.id)
    if (user) deleteNoteFromFirestore(user.uid, note.id)
    router.push("/notes")
  }

  if (authLoading || !note) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink">
      <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/notes"
              className="w-9 h-9 rounded-xl bg-surface-card border border-primary/5 flex items-center justify-center text-canvas-soft/50 hover:text-primary hover:border-primary/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Save className={`w-3.5 h-3.5 ${saving ? "text-primary animate-pulse" : "text-primary/40"}`} />
              <span className="text-caption text-canvas-soft/30">
                {saving
                  ? "Saving..."
                  : lastSaved
                    ? `Saved ${lastSaved.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`
                    : "Unsaved"}
              </span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="w-9 h-9 rounded-xl border border-negative/20 flex items-center justify-center text-negative/50 hover:text-negative hover:bg-negative/10 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Editor */}
        <div className="rounded-2xl bg-surface-card border border-primary/5 p-6 md:p-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full bg-transparent text-display-xs text-canvas-soft placeholder:text-canvas-soft/20 font-bold border-none outline-none mb-6"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="w-full bg-transparent text-body-md text-canvas-soft/80 placeholder:text-canvas-soft/20 border-none outline-none resize-none min-h-[50vh] leading-relaxed"
          />
        </div>
      </div>
    </div>
  )
}
