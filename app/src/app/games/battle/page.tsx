"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { createRoom, joinRoom } from "@/lib/battle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Swords, LogIn, Sparkles, Trophy, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BattleLobbyPage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [mode, setMode] = useState<"create" | "join">("create")
  const [roomCode, setRoomCode] = useState("")
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)

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

  const handleCreate = async () => {
    setCreating(true)
    try {
      const code = await createRoom(user.uid, userData?.name || "Player")
      router.push(`/games/battle/${code}`)
    } catch {
      toast("Failed to create room.", "error")
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async () => {
    if (roomCode.trim().length < 4) return
    setJoining(true)
    try {
      const ok = await joinRoom(roomCode.trim(), user.uid, userData?.name || "Player")
      if (ok) {
        router.push(`/games/battle/${roomCode.trim().toUpperCase()}`)
      } else {
        toast("Room not found or already started.", "error")
      }
    } catch {
      toast("Failed to join room.", "error")
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/games" className="inline-flex items-center gap-1 text-caption font-semibold text-canvas-soft/40 hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-3 h-3" /> Game Zone
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Swords className="w-3 h-3" /> Competitive Mode
          </div>
          <h1 className="text-display-sm text-canvas-soft">Battle Arena</h1>
          <p className="text-body-sm text-canvas-soft/40 mt-2 max-w-sm mx-auto">
            Create a room and invite friends. Fastest finger wins!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface-card rounded-xl p-1 mb-6 border border-primary/5">
          <button
            onClick={() => setMode("create")}
            className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              mode === "create" ? "bg-primary text-on-primary" : "text-canvas-soft/50 hover:text-canvas-soft"
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-1.5" /> Create Room
          </button>
          <button
            onClick={() => setMode("join")}
            className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              mode === "join" ? "bg-primary text-on-primary" : "text-canvas-soft/50 hover:text-canvas-soft"
            }`}
          >
            <LogIn className="w-4 h-4 inline mr-1.5" /> Join Room
          </button>
        </div>

        <Card className="bg-surface-card rounded-xl p-8 border-0">
          {mode === "create" ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-display-xs text-canvas-soft mb-2">Create a Battle Room</h2>
                <p className="text-body-sm text-canvas-soft/40 max-w-sm mx-auto">
                  A 6-character room code will be generated. Share it with friends to challenge them.
                </p>
              </div>
              <Button variant="primary" size="lg" onClick={handleCreate} disabled={creating} className="w-full cursor-pointer">
                {creating ? "Creating..." : "Create & Invite"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-display-xs text-canvas-soft mb-2">Join a Room</h2>
                <p className="text-body-sm text-canvas-soft/40">
                  Enter the 6-character room code shared by your friend.
                </p>
              </div>
              <div>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ROOM CODE"
                  maxLength={6}
                  className="w-full text-center text-2xl font-black tracking-[0.3em] uppercase bg-ink border border-primary/20 rounded-xl px-4 py-5 text-canvas-soft placeholder:text-canvas-soft/20 focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                />
              </div>
              <Button variant="primary" size="lg" onClick={handleJoin} disabled={joining || roomCode.trim().length < 4} className="w-full cursor-pointer">
                {joining ? "Joining..." : "Join Battle"}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
