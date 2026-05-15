/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState, useRef } from "react"
import { Globe } from "lucide-react"

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
]

const GOOGLE_LANG_MAP: Record<string, string> = {
  en: "en", hi: "hi", bn: "bn", te: "te", mr: "mr", ta: "ta",
  ur: "ur", gu: "gu", kn: "kn", ml: "ml", pa: "pa",
  es: "es", fr: "fr",
}

function setCookie(name: string, value: string, days?: number) {
  if (typeof document === "undefined") return
  let cookie = `${name}=${value}; path=/`
  if (days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    cookie += `; expires=${expires}`
  }
  document.cookie = cookie
}

function detectLang(): string {
  if (typeof document === "undefined") return "en"
  const match = document.cookie.match(/googtrans=.*\/([a-z]{2})/)
  return match ? match[1] : "en"
}

export default function LanguageSelector() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState("en")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrent(detectLang())
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const switchLanguage = (langCode: string) => {
    setCurrent(langCode)
    setOpen(false)

    if (langCode === "en") {
      setCookie("googtrans", "", -1)
    } else {
      const gtCode = GOOGLE_LANG_MAP[langCode] || langCode
      setCookie("googtrans", `/en/${gtCode}`)
    }

    window.location.reload()
  }

  const currentLang = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0]

  useEffect(() => {
    const hasGoogle = typeof (window as unknown as Record<string, unknown>).google !== "undefined"
    if (document.getElementById("gt-script") || hasGoogle) return

    const script = document.createElement("script")
    script.id = "gt-script"
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"

    const w = window as unknown as Record<string, unknown>
    w.googleTranslateElementInit = () => {
      const g = (window as unknown as Record<string, unknown>).google as {
        translate: { TranslateElement: new (config: Record<string, unknown>, id: string) => void }
      }
      if (g?.translate) {
        new g.translate.TranslateElement(
          { pageLanguage: "en", includedLanguages: Object.keys(GOOGLE_LANG_MAP).join(","), autoDisplay: false },
          "google_translate_element"
        )
      }
    }
    document.head.appendChild(script)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-canvas-soft/50 hover:text-primary hover:bg-surface-elevated transition-all cursor-pointer"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{currentLang.native}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-surface-card border border-primary/10 shadow-2xl shadow-black/40 overflow-hidden z-[100]">
          <div className="max-h-64 overflow-y-auto py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                  current === lang.code
                    ? "text-primary bg-primary/10"
                    : "text-canvas-soft/60 hover:text-canvas-soft hover:bg-surface-elevated"
                }`}
              >
                <span className="font-semibold">{lang.native}</span>
                <span className="text-caption text-canvas-soft/30 ml-2">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div id="google_translate_element" className="hidden" />
    </div>
  )
}
