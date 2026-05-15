"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { generateId, saveNoteLocally } from "@/lib/sync"

export default function NewNotePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace("/login")
      return
    }

    const id = generateId()
    saveNoteLocally({
      id,
      title: "Untitled Note",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    router.replace(`/notes/${id}`)
  }, [user, authLoading, router])

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}
