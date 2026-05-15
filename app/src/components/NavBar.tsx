/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { X } from "lucide-react"

function getAuth() {
  if (!auth) throw new Error("Auth not initialized")
  return auth
}

export default function NavBar() {
  const { user, userData } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  const handleLogout = async () => {
    await signOut(getAuth())
    setMenuOpen(false)
  }

  const isLanding = pathname === "/"

  return (
    <nav className="sticky top-0 z-50 bg-ink border-b border-primary/5">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3 md:py-4">
        {/* Logo */}
        <Link
          href={user ? "/dashboard" : "/"}
          className="text-xl md:text-2xl font-black tracking-tighter text-primary hover:text-primary-active transition-colors"
        >
          BIT2BYTE
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href={user ? "/dashboard" : "/"}
            className="text-sm font-semibold text-canvas-soft/70 hover:text-primary transition-colors"
          >
            {user ? "Dashboard" : "Home"}
          </Link>
          {isLanding && (
            <a
              href="#features"
              className="text-sm font-semibold text-canvas-soft/70 hover:text-primary transition-colors"
            >
              Features
            </a>
          )}
          {user && (
            <>
              <Link
                href="/videos"
                className="text-sm font-semibold text-canvas-soft/70 hover:text-primary transition-colors"
              >
                Videos
              </Link>
              <Link
                href="/battle"
                className="text-sm font-semibold text-canvas-soft/70 hover:text-primary transition-colors"
              >
                Battle
              </Link>
              <Link
                href="/notes"
                className="text-sm font-semibold text-canvas-soft/70 hover:text-primary transition-colors"
              >
                Notes
              </Link>
              <Link
                href="/profile"
                className="text-sm font-semibold text-canvas-soft/70 hover:text-primary transition-colors"
              >
                Profile
              </Link>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Google Translate */}
          <div id="google_translate_element" className="scale-75 md:scale-90 origin-right" />

          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1">
                <span className="text-[10px] font-bold text-primary">✦</span>
                <span className="text-xs font-semibold text-primary">{userData?.xp || 0}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-canvas-soft leading-tight">
                  {userData?.name || "Student"}
                </p>
                <p className="text-[10px] text-canvas-soft/40 uppercase tracking-wider">
                  Grade {userData?.grade || "—"}
                </p>
              </div>
              <Link
                href="/profile"
                className="w-9 h-9 rounded-full bg-surface-card border border-primary/10 flex items-center justify-center text-sm font-bold text-primary hover:border-primary/30 transition-colors"
              >
                {(userData?.name || "S").charAt(0).toUpperCase()}
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-canvas-soft/40 hover:text-negative transition-colors cursor-pointer"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary-active transition-colors"
            >
              Log in
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative w-8 h-8 flex items-center justify-center cursor-pointer z-[60]"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.5">
              <span
                className={`block h-[2px] w-5 bg-canvas-soft/70 transition-all duration-300 ${
                  menuOpen ? "rotate-45 translate-y-[4.5px]" : ""
                }`}
              />
              <span
                className={`block h-[2px] w-5 bg-canvas-soft/70 transition-all duration-300 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-[2px] w-5 bg-canvas-soft/70 transition-all duration-300 ${
                  menuOpen ? "-rotate-45 -translate-y-[4.5px]" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* ─── Side Drawer (mobile) ─── */}

      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={() => setMenuOpen(false)}
        className={`md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`md:hidden fixed top-0 right-0 z-50 h-full w-[280px] bg-surface-card border-l border-primary/5 shadow-2xl transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Drawer header */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-sm font-semibold text-canvas-soft/40 uppercase tracking-wider">
              Menu
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-canvas-soft/40 hover:text-canvas-soft hover:bg-surface-elevated transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation links */}
          <div className="space-y-1 flex-1">
            <NavDrawerLink
              href={user ? "/dashboard" : "/"}
              active={pathname === "/" || pathname.startsWith("/dashboard")}
            >
              {user ? "Dashboard" : "Home"}
            </NavDrawerLink>
            {isLanding && (
              <NavDrawerLink href="#features" active={false}>
                Features
              </NavDrawerLink>
            )}
            {user && (
              <>
                <NavDrawerLink href="/videos" active={pathname.startsWith("/videos") || pathname.startsWith("/video")}>
                  Videos
                </NavDrawerLink>
                <NavDrawerLink href="/battle" active={pathname.startsWith("/battle")}>
                  Battle
                </NavDrawerLink>
                <NavDrawerLink href="/notes" active={pathname.startsWith("/notes")}>
                  Notes
                </NavDrawerLink>
                <NavDrawerLink href="/profile" active={pathname === "/profile"}>
                  Profile
                </NavDrawerLink>
              </>
            )}
          </div>

          {/* Bottom section */}
          <div className="pt-6 border-t border-primary/5">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {(userData?.name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-canvas-soft truncate">
                      {userData?.name || "Student"}
                    </p>
                    <p className="text-xs text-canvas-soft/40">
                      Grade {userData?.grade || "—"} &middot; {userData?.xp || 0} XP
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl border border-negative/30 text-negative text-sm font-semibold py-2.5 hover:bg-negative/10 transition-colors cursor-pointer"
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-center rounded-xl bg-primary text-on-primary py-2.5 text-sm font-semibold hover:bg-primary-active transition-colors"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavDrawerLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-canvas-soft/70 hover:bg-surface-elevated hover:text-canvas-soft"
      }`}
    >
      {children}
    </Link>
  )
}
