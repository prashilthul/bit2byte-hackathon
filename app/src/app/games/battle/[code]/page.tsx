/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import {
  subscribeRoom,
  subscribePlayers,
  startBattle,
  submitAnswer,
  deleteRoom,
  updateRating,
  calculateRatingDelta,
  type BattleRoom,
  type BattlePlayer,
} from "@/lib/battle"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Swords, Timer, Trophy, Users, ArrowLeft, ChevronRight, Crown } from "lucide-react"

export default function BattlePage() {
  const { code } = useParams<{ code: string }>()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [room, setRoom] = useState<BattleRoom | null>(null)
  const [players, setPlayers] = useState<BattlePlayer[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(15)
  const [ratingDelta, setRatingDelta] = useState(0)
  const [resultPlayers, setResultPlayers] = useState<BattlePlayer[]>([])
  const [answered, setAnswered] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace("/login"); return }
  }, [user, authLoading, router])

  useEffect(() => {
    const unsubRoom = subscribeRoom(code, (r) => {
      if (!r) { toast("Room not found.", "error"); router.push("/games/battle"); return }
      setRoom(r)
      if (r.status === "finished") {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    })
    const unsubPlayers = subscribePlayers(code, (p) => {
      setPlayers(p)
    })
    return () => {
      unsubRoom()
      unsubPlayers()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [code, router, toast])

  const myPlayer = players.find((p) => p.uid === user?.uid)
  const totalQuestions = room?.questions.length || 0
  const myCurrentQ = myPlayer?.currentQ ?? 0
  const myFinished = myPlayer?.finished ?? false
  const currentQ = room?.questions[myCurrentQ]

  // Auto-submit when timer runs out
  const autoSubmitRef = useRef<() => void>(() => {})
  const handleAutoSubmit = useCallback(async () => {
    if (!room || !user || answered) return
    setAnswered(true)
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    const timeMs = 15000
    await submitAnswer(code, user.uid, myCurrentQ, -1, timeMs, false, totalQuestions)
    setTimeout(() => {
      setSelected(null)
      setAnswered(false)
    }, 1500)
  }, [room, user, answered, code, myCurrentQ, totalQuestions])

  useEffect(() => { autoSubmitRef.current = handleAutoSubmit }, [handleAutoSubmit])

  // Timer: runs only while playing and this player hasn't answered current question
  useEffect(() => {
    if (room?.status !== "playing" || answered || myFinished) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
      return
    }
    setTimeLeft(15)

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          autoSubmitRef.current()
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }
  }, [room?.status, myCurrentQ, answered, myFinished])

  const handleStart = useCallback(async () => {
    await startBattle(code)
  }, [code])

  const handleSelect = useCallback(async (idx: number) => {
    if (selected !== null || !room || !user || answered) return
    setSelected(idx)
    setAnswered(true)
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }

    const correct = idx === currentQ?.answer
    await submitAnswer(code, user.uid, myCurrentQ, idx, 15000 - timeLeft * 1000, correct, totalQuestions)

    // After 1.5s, reset for next question
    setTimeout(() => {
      setSelected(null)
      setAnswered(false)
    }, 1500)
  }, [selected, room, user, answered, code, myCurrentQ, currentQ, timeLeft, totalQuestions])

  const handleFinish = useCallback(async () => {
    const scores = players.map((p) => p.score)
    const myScore = myPlayer?.score || 0
    const delta = calculateRatingDelta(myScore, scores)
    setRatingDelta(delta)
    setResultPlayers([...players])

    try {
      await updateRating(user!.uid, "battle", delta)
    } catch {}

    try {
      setTimeout(() => deleteRoom(code), 60000)
    } catch {}
  }, [players, myPlayer, code, user])

  useEffect(() => {
    if (room?.status === "finished" && resultPlayers.length === 0 && players.length > 0) {
      handleFinish()
    }
  }, [room?.status, handleFinish, resultPlayers.length, players.length])

  if (authLoading || !user) return null
  if (!room) {
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

      <div className="relative mx-auto max-w-5xl px-4 py-6 md:py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/games/battle" className="flex items-center gap-2 text-caption font-bold uppercase tracking-wider text-canvas-soft/40 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Lobby
          </Link>
          <div className="flex items-center gap-3">
            <Swords className="w-4 h-4 text-primary" />
            <span className="text-caption font-bold uppercase tracking-widest text-primary">{code}</span>
          </div>
        </div>

        {/* ─── WAITING ─── */}
        {room.status === "waiting" && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-display-xs text-canvas-soft mb-2">Waiting for Players</h2>
            <p className="text-body-sm text-canvas-soft/40 mb-2">Room code: <span className="text-primary font-bold text-xl tracking-[0.3em]">{code}</span></p>
            <p className="text-body-sm text-canvas-soft/30 mb-8 max-w-sm">Share this code with friends. Host can start when everyone is in.</p>
            <div className="w-full max-w-sm space-y-2 mb-8">
              {players.map((p) => (
                <div key={p.uid} className="flex items-center gap-3 rounded-xl bg-surface-card border border-primary/5 px-4 py-3">
                  <span className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-body-md-strong text-canvas-soft flex-1 text-left">{p.name}</span>
                  {p.uid === room.hostId && <Crown className="w-4 h-4 text-primary" />}
                </div>
              ))}
            </div>
            {players.length === 0 && <p className="text-body-sm text-canvas-soft/30 mb-8">No players yet...</p>}
            {user.uid === room.hostId && (
              <Button variant="primary" size="lg" onClick={handleStart} disabled={players.length < 2} className="cursor-pointer px-10">
                Start Battle <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            )}
            {user.uid !== room.hostId && <p className="text-body-sm text-primary/60 animate-pulse">Waiting for host to start...</p>}
            {user.uid === room.hostId && players.length < 2 && <p className="text-body-sm text-canvas-soft/30 mt-2">Need at least 2 players to start</p>}
          </div>
        )}

        {/* ─── PLAYING ─── */}
        {room.status === "playing" && (
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {myFinished ? (
                <div className="rounded-2xl bg-surface-card border border-primary/5 p-8 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h2 className="text-display-xs text-canvas-soft mb-2">All questions answered!</h2>
                  <p className="text-body-sm text-canvas-soft/40">Waiting for other players to finish...</p>
                </div>
              ) : currentQ ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-caption text-canvas-soft/30 uppercase tracking-wider">
                      Your Question {myCurrentQ + 1} of {totalQuestions}
                    </span>
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4" style={{ color: timeLeft > 5 ? "#9fe870" : "#d03238" }} />
                      <span className="text-body-md-strong font-mono" style={{ color: timeLeft > 5 ? "#9fe870" : "#d03238" }}>{timeLeft}s</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden mb-6">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(myCurrentQ / totalQuestions) * 100}%`, background: timeLeft > 5 ? "#9fe870" : "#d03238" }} />
                  </div>
                  <div className="rounded-2xl bg-surface-card border border-primary/5 p-6 md:p-8">
                    <p className="text-caption text-primary/60 uppercase tracking-wider font-semibold mb-2">Question</p>
                    <h2 className="text-display-xs text-canvas-soft mb-6">{currentQ.q}</h2>
                    <div className="space-y-3">
                      {currentQ.options.map((opt, oi) => {
                        const isCorrect = oi === currentQ.answer
                        const isSelected = selected === oi
                        let cls = "border-surface-elevated bg-ink text-canvas-soft/70"
                        if (isSelected && isCorrect) cls = "border-primary bg-primary/10 text-primary"
                        else if (isSelected && !isCorrect) cls = "border-negative/50 bg-negative/10 text-negative"
                        else if (answered && isCorrect) cls = "border-primary/30 bg-primary/5 text-primary/70"
                        else if (answered) cls = "border-surface-elevated bg-ink text-canvas-soft/30"
                        return (
                          <button key={oi} disabled={answered} onClick={() => handleSelect(oi)}
                            className={`w-full text-left rounded-xl border-2 px-5 py-4 text-body-md transition-all cursor-pointer ${cls}`}>
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mr-3 ${
                              answered && isCorrect ? "bg-primary text-on-primary" :
                              isSelected ? "bg-primary/20 text-primary" : "bg-surface-elevated text-canvas-soft/40"
                            }`}>{String.fromCharCode(65 + oi)}</span>
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Leaderboard */}
            <div className="space-y-3">
              <h3 className="text-body-md-strong text-canvas-soft flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" /> Rankings
              </h3>
              <div className="space-y-2">
                {players.map((p, i) => (
                  <div key={p.uid}
                    className={`rounded-xl border p-3 transition-all ${p.uid === user.uid ? "bg-primary/10 border-primary/30" : "bg-surface-card border-primary/5"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i === 0 ? "bg-primary text-on-primary" :
                          i === 1 ? "bg-primary/70 text-on-primary" :
                          i === 2 ? "bg-primary/50 text-on-primary" :
                          "bg-surface-elevated text-canvas-soft/40"
                        }`}>{i + 1}</span>
                        <span className="text-sm font-semibold text-canvas-soft truncate">{p.name}</span>
                        {p.finished && <span className="text-caption text-primary/60">✓</span>}
                      </div>
                      <span className="text-sm font-bold text-primary">{p.score}</span>
                    </div>
                  </div>
                ))}
              </div>
              {myPlayer && (
                <div className="rounded-xl bg-surface-card border border-primary/5 p-3 text-center">
                  <span className="text-caption text-canvas-soft/30 uppercase tracking-wider">Your Score</span>
                  <p className="text-display-xs text-primary font-black">{myPlayer.score}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── FINISHED ─── */}
        {room.status === "finished" && (
          <div className="flex flex-col items-center py-8 text-center">
            <Trophy className="w-20 h-20 text-primary mb-4" />
            <h2 className="text-display-sm text-canvas-soft mb-2">Battle Over!</h2>
            <p className="text-body-sm text-canvas-soft/40 mb-8">Here are the final standings.</p>
            <div className="w-full max-w-md space-y-2 mb-8">
              {(resultPlayers.length > 0 ? resultPlayers : players).map((p, i) => {
                const isMe = p.uid === user.uid
                return (
                  <div key={p.uid}
                    className={`rounded-xl border-2 p-4 transition-all ${
                      i === 0 ? "border-primary/40 bg-primary/5" :
                      i === 1 ? "border-primary/20 bg-primary/5" :
                      i === 2 ? "border-primary/10 bg-primary/5" :
                      "border-primary/5 bg-surface-card"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          i === 0 ? "bg-primary text-on-primary" :
                          i === 1 ? "bg-primary/80 text-on-primary" :
                          i === 2 ? "bg-primary/60 text-on-primary" :
                          "bg-surface-elevated text-canvas-soft/40"
                        }`}>{i + 1}</span>
                        <div className="text-left min-w-0">
                          <p className="text-body-md-strong text-canvas-soft truncate">
                            {p.name} {isMe && <span className="text-caption text-primary">(you)</span>}
                          </p>
                          <p className="text-caption text-canvas-soft/30">
                            {p.answers?.filter((a) => a.correct).length || 0}/{p.answers?.length || 0} correct
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-display-xs text-primary font-black">{p.score}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="rounded-xl bg-surface-card border border-primary/5 px-6 py-3 mb-8">
              <span className="text-caption text-canvas-soft/30 uppercase tracking-wider">Rating</span>
              <p className={`text-display-xs font-black ${ratingDelta >= 0 ? "text-primary" : "text-negative"}`}>
                {ratingDelta >= 0 ? "+" : ""}{ratingDelta}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/games/battle"><Button variant="secondary" className="bg-surface-elevated text-canvas-soft hover:bg-surface-card cursor-pointer">New Battle</Button></Link>
              <Link href="/profile"><Button variant="primary" className="cursor-pointer">View Profile <ChevronRight className="w-4 h-4 ml-1" /></Button></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
