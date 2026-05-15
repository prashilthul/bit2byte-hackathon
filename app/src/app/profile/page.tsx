"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { updateUserGrade } from "@/lib/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trophy, BookOpen, LogOut, Sparkles, Target, ChevronRight } from "lucide-react"

function getAuth() {
  if (!auth) throw new Error("Auth not initialized")
  return auth
}

export default function ProfilePage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace("/login")
    }
  }, [user, authLoading, router])

  const handleLogout = async () => {
    setSigningOut(true)
    await signOut(getAuth())
    router.push("/")
  }

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-ink flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user || !userData) return null

  const quizzesDone = userData.quizzesDone?.length || 0
  const xp = userData.xp || 0

  return (
    <div className="min-h-[calc(100vh-64px)] bg-ink">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 py-8 md:py-12">
        <h1 className="text-display-md text-canvas-soft mb-8 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary" />
          Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card className="bg-surface-card rounded-xl p-6 border border-primary/5 md:col-span-1">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-3xl mb-4">
                {userData.name?.charAt(0)?.toUpperCase() || "👤"}
              </div>
              <CardTitle className="text-display-xs text-canvas-soft">
                {userData.name || "Student"}
              </CardTitle>
              <p className="text-body-sm text-canvas-soft/40 mt-1">
                {user.email}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-primary/5">
                <span className="text-body-sm text-canvas-soft/40">Grade</span>
                <select
                  value={userData.grade}
                  onChange={async (e) => {
                    const newGrade = parseInt(e.target.value)
                    if (newGrade === userData.grade) return
                    try {
                      await updateUserGrade(user.uid, newGrade)
                      // The AuthContext should automatically pick up changes if it listens to snapshots,
                      // or we can suggest a reload/manual update if needed.
                      // Most AuthContext implementations with Firestore use onSnapshot.
                    } catch (err) {
                      console.error("Failed to update grade", err)
                    }
                  }}
                  className="bg-primary/10 text-primary border border-primary/20 rounded-md px-2 py-1 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <option key={g} value={g} className="bg-surface-card text-canvas-soft">
                      Grade {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-primary/5">
                <span className="text-body-sm text-canvas-soft/40">Member since</span>
                <span className="text-body-sm-strong text-canvas-soft/70">
                  {user.metadata.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <Button
                variant="tertiary"
                size="md"
                onClick={handleLogout}
                disabled={signingOut}
                className="w-full mt-4 border-negative/30 text-negative hover:bg-negative/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {signingOut ? "Logging out..." : "Log Out"}
              </Button>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="md:col-span-2 space-y-6">
            {/* XP & Quizzes */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-surface-card rounded-xl p-6 text-center border border-primary/5">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-display-md text-primary font-black">{xp}</p>
                <p className="text-body-sm text-canvas-soft/40 mt-1">Total XP</p>
              </Card>
              <Card className="bg-surface-card rounded-xl p-6 text-center border border-primary/5">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-display-md text-canvas-soft font-black">
                  {quizzesDone}
                </p>
                <p className="text-body-sm text-canvas-soft/40 mt-1">Quizzes Done</p>
              </Card>
            </div>

            {/* Achievement */}
            <Card className="bg-surface-card rounded-xl p-8 text-center border border-primary/5">
              <Target className="w-10 h-10 mx-auto mb-3 text-primary" />
              <CardTitle className="text-display-xs text-canvas-soft mb-2">
                {quizzesDone >= 5
                  ? "Keep up the great work!"
                  : quizzesDone >= 1
                    ? "You've started your journey!"
                    : "Start your first quiz!"}
              </CardTitle>
              <p className="text-body-sm text-canvas-soft/50 mb-6 max-w-md mx-auto">
                {quizzesDone >= 10
                  ? "Amazing dedication! You're a learning machine."
                  : quizzesDone >= 5
                    ? `You've completed ${quizzesDone} quizzes. Can you reach 10?`
                    : quizzesDone >= 1
                      ? `Complete ${5 - quizzesDone} more quiz${5 - quizzesDone !== 1 ? "zes" : ""} to unlock a special badge.`
                      : "Complete a quiz to earn XP and unlock achievements."}
              </p>
              <Link href="/dashboard">
                <Button variant="primary" size="md" className="cursor-pointer">
                  {quizzesDone > 0 ? "Continue Learning" : "Take Your First Quiz"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
