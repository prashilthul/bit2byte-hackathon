"use client"

import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { auth, db } from "@/lib/firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function getAuth() {
  if (!auth) throw new Error("Auth not initialized")
  return auth
}

function getDb() {
  if (!db) throw new Error("Firestore not initialized")
  return db
}

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [grade, setGrade] = useState("8")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard")
    }
  }, [user, authLoading, router])

  if (authLoading) return null
  if (user) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(getAuth(), email, password)
        await setDoc(doc(getDb(), "users", cred.user.uid), {
          name,
          grade: parseInt(grade),
          xp: 0,
          quizzesDone: [],
        })
        toast("Account created! Welcome aboard.", "success")
      } else {
        await signInWithEmailAndPassword(getAuth(), email, password)
        toast("Welcome back!", "success")
      }
      router.push("/dashboard")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      toast(
        msg.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "").trim() ||
          "Something went wrong",
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(getAuth(), provider)
      const firebaseUser = result.user
      const userDoc = await getDoc(doc(getDb(), "users", firebaseUser.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(getDb(), "users", firebaseUser.uid), {
          name: firebaseUser.displayName || "Student",
          grade: 8,
          xp: 0,
          quizzesDone: [],
        })
      }
      toast("Signed in with Google!", "success")
      router.push("/dashboard")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ""
      if (!msg.includes("popup-closed-by-user")) {
        toast(
          msg.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "").trim() ||
            "Google sign-in failed",
          "error"
        )
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-ink">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <Card className="relative w-full max-w-md bg-surface-card rounded-xl p-8 border-0 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-display-sm text-canvas-soft">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <p className="text-body-sm text-canvas-soft/50 mt-2">
            {isSignUp
              ? "Sign up to start learning"
              : "Log in to continue your journey"}
          </p>
        </CardHeader>
        <CardContent>
          <Button
            variant="primary"
            size="md"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-ink border border-mute/30 text-canvas-soft hover:bg-surface-elevated cursor-pointer mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-mute/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface-card px-3 text-mute">or email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-body-sm-strong text-canvas-soft mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-mute/30 bg-ink px-4 py-3 text-body-md text-canvas-soft placeholder:text-mute/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-body-sm-strong text-canvas-soft mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-mute/30 bg-ink px-4 py-3 text-body-md text-canvas-soft placeholder:text-mute/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-body-sm-strong text-canvas-soft mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-mute/30 bg-ink px-4 py-3 text-body-md text-canvas-soft placeholder:text-mute/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="At least 6 characters"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-body-sm-strong text-canvas-soft mb-1.5">
                  Grade
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full rounded-md border border-mute/30 bg-ink px-4 py-3 text-body-md text-canvas-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="w-full cursor-pointer"
            >
              {loading
                ? "Please wait..."
                : isSignUp
                  ? "Create Account"
                  : "Log In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-body-sm-strong text-canvas-soft/70 underline underline-offset-4 hover:text-primary transition-colors cursor-pointer"
            >
              {isSignUp
                ? "Already have an account? Log in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
