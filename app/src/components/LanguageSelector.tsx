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

export default function LanguageSelector() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState("en")
  const [ready, setReady] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectRef = useRef<HTMLSelectElement | null>(null)

  // Initialize Google Translate on mount
  useEffect(() => {
    const init = () => {
      if (typeof window === "undefined" || typeof google === "undefined" || !google.translate) {
        setTimeout(init, 500)
        return
      }
      try {
        new google.translate.TranslateElement(
          { pageLanguage: "en", includedLanguages: "en,hi,bn,te,mr,ta,ur,gu,kn,ml,pa,es,fr", autoDisplay: false },
          "google_translate_element"
        )
        // Poll for the select element to appear
        const poll = setInterval(() => {
          const sel = document.querySelector(".goog-te-combo") as HTMLSelectElement | null
          if (sel) {
            selectRef.current = sel
            clearInterval(poll)
            setReady(true)
          }
        }, 200)
      } catch {
        setTimeout(init, 1000)
      }
    }

    // Load script if not already loaded
    if (!document.getElementById("gt-script")) {
      const script = document.createElement("script")
      script.id = "gt-script"
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      // Define the global callback
      ;(window as any).googleTranslateElementInit = init
      document.head.appendChild(script)
    } else if (typeof google !== "undefined" && google.translate) {
      init()
    }
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

    const select = selectRef.current || (document.querySelector(".goog-te-combo") as HTMLSelectElement | null)
    if (!select) return

    if (langCode === "en") {
      select.value = ""
      select.dispatchEvent(new Event("change"))
      return
    }

    const googleLangMap: Record<string, string> = {
      hi: "hi", bn: "bn", te: "te", mr: "mr", ta: "ta",
      ur: "ur", gu: "gu", kn: "kn", ml: "ml", pa: "pa",
      es: "es", fr: "fr",
    }
    select.value = googleLangMap[langCode] || langCode
    select.dispatchEvent(new Event("change"))
  }

  const currentLang = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0]

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
