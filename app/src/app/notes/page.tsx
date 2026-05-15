"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import {
  getNotes,
  deleteNoteLocally,
  deleteNoteFromFirestore,
  generateId,
  saveNoteLocally,
  mergeNotesFromFirestore,
  type Note,
} from "@/lib/sync"
import Link from "next/link"
import { Plus, Search, Trash2, FileText, Clock } from "lucide-react"
import { useConfirm } from "@/components/ui/confirm"

export default function NotesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [search, setSearch] = useState("")
  const [ready, setReady] = useState(false)
  const { confirm } = useConfirm()

  const refresh = useCallback(() => {
    setNotes(getNotes())
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace("/login")
      return
    }

    mergeNotesFromFirestore(user.uid).finally(() => {
      refresh()
      setReady(true)
    })
  }, [user, authLoading, router, refresh])

  const handleCreate = () => {
    const id = generateId()
    saveNoteLocally({
      id,
      title: "Untitled Note",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    refresh()
    router.push(`/notes/${id}`)
  }

  const handleDelete = async (e: React.MouseEvent, note: Note) => {
    e.preventDefault()
    e.stopPropagation()
    const ok = await confirm({ title: "Delete note", message: `Delete "${note.title || "Untitled"}"?`, confirmLabel: "Delete", variant: "danger" })
    if (!ok) return
    deleteNoteLocally(note.id)
    if (user) deleteNoteFromFirestore(user.uid, note.id)
    refresh()
  }

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  )

  if (authLoading || !ready) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:py-14">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-display-sm text-canvas-soft">Notes</h1>
            <p className="text-body-sm text-canvas-soft/40 mt-1">
              {notes.length} note{notes.length !== 1 ? "s" : ""}
              {notes.length > 0 && (
                <span className="text-canvas-soft/20"> &middot; {filtered.length} shown</span>
              )}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary-active transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-canvas-soft/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full rounded-xl bg-surface-card border border-primary/5 pl-11 pr-4 py-3 text-body-sm text-canvas-soft placeholder:text-canvas-soft/20 focus:outline-none focus:border-primary/30 transition-colors"
          />
        </div>

        {/* Notes grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FileText className="w-14 h-14 text-canvas-soft/20 mb-5" />
            <h2 className="text-display-xs text-canvas-soft mb-2">
              {notes.length === 0 ? "No notes yet" : "No notes match your search"}
            </h2>
            <p className="text-body-sm text-canvas-soft/40 max-w-sm mb-6">
              {notes.length === 0
                ? "Create your first note to get started. They're stored offline and sync when you're online."
                : "Try a different search term."}
            </p>
            {notes.length === 0 && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary-active transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create Note
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="group block rounded-2xl bg-surface-card border border-primary/5 p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-body-md-strong text-canvas-soft truncate group-hover:text-primary transition-colors">
                      {note.title || "Untitled"}
                    </h3>
                    <p className="text-body-sm text-canvas-soft/30 mt-1 line-clamp-2">
                      {note.content || "No content"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, note)}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-canvas-soft/20 hover:text-negative hover:bg-negative/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-4 text-caption text-canvas-soft/20">
                  <Clock className="w-3 h-3" />
                  {new Date(note.updatedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
