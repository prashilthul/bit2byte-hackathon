"use client"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "@studio-freight/lenis"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calculator, FlaskConical, Globe, Sparkles, User, GraduationCap, Laptop, BookOpen, Brain, Zap, Target } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const ORBIT_POSITIONS = [
  { left: "8%", top: "12%", opacity: 0.8 },
  { left: "12%", top: "82%", opacity: 0.7 },
  { left: "82%", top: "18%", opacity: 0.8 },
  { left: "88%", top: "78%", opacity: 0.7 },
  { left: "4%", top: "48%", opacity: 0.6 },
  { left: "96%", top: "52%", opacity: 0.6 },
  { left: "42%", top: "8%", opacity: 0.7 },
  { left: "52%", top: "92%", opacity: 0.7 },
]

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (loading || user) return

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    const ctx = gsap.context(() => {
      // ─── 1. Letter Bounce ───
      const titleChars = document.querySelectorAll(".hero-title .char")
      gsap.from(titleChars, {
        y: 80,
        opacity: 0,
        rotateX: -90,
        stagger: 0.05,
        duration: 1,
        ease: "back.out(1.7)",
        delay: 0.3
      })

      // ─── 2. Floating Icons ───
      const elements = document.querySelectorAll(".orbit-element")
      elements.forEach((el, i) => {
        gsap.to(el, {
          x: i % 2 === 0 ? 30 : -30,
          y: i % 3 === 0 ? -30 : 30,
          duration: 5 + i,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        })
      })

      // ─── 3. Word Spotlight (Improved Spacing) ───
      const words = document.querySelectorAll(".manifesto-word")
      words.forEach((word) => {
        gsap.to(word, {
          color: "#1a1b18",
          backgroundColor: "#9fe870",
          scrollTrigger: {
            trigger: word,
            start: "top 80%",
            end: "top 40%",
            scrub: true,
          }
        })
      })

      // ─── 4. Card Stacking ───
      const cardElements = document.querySelectorAll(".stack-card")
      cardElements.forEach((card, i) => {
        if (i === cardElements.length - 1) return
        ScrollTrigger.create({
          trigger: card,
          start: "top 5%",
          endTrigger: ".stack-section",
          end: "bottom bottom",
          scrub: true,
          animation: gsap.to(card, {
            scale: 0.98,
            opacity: 0.7,
            y: -10,
            ease: "none"
          })
        })
      })

    }, containerRef)

    return () => {
      ctx.revert()
      lenis.destroy()
    }
  }, [user, loading])

  if (loading || user) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const subjects = [
    { 
      name: "Quantum Math", 
      icon: <Calculator />, 
      color: "text-[#9fe870]", 
      bg: "bg-[#9fe870]/10", 
      border: "border-[#9fe870]/30",
      desc: "Go beyond standard arithmetic. Master the logic that powers the universe.", 
      title: "Think in Patterns.",
      hook: "ALGEBRA • LOGIC • ANALYSIS" 
    },
    { 
      name: "Apex Science", 
      icon: <FlaskConical />, 
      color: "text-[#00f5ff]", 
      bg: "bg-[#00f5ff]/10", 
      border: "border-[#00f5ff]/30",
      desc: "Simulate advanced chemistry and physics with a single tap.", 
      title: "Unlock Discovery.",
      hook: "PHYSICS • BIOLOGY • CHEM" 
    },
    { 
      name: "Global History", 
      icon: <Globe />, 
      color: "text-[#ffcc00]", 
      bg: "bg-[#ffcc00]/10", 
      border: "border-[#ffcc00]/30",
      desc: "Understand how the past dictates your digital future.", 
      title: "Legacy of Mind.",
      hook: "CIVILIZATIONS • MAPS" 
    },
    { 
      name: "Digital Edge", 
      icon: <Laptop />, 
      color: "text-[#ff8c00]", 
      bg: "bg-[#ff8c00]/10", 
      border: "border-[#ff8c00]/30",
      desc: "Build tools, write code, and lead the rural tech revolution.", 
      title: "Code your Path.",
      hook: "NODE • REACT • LOGIC" 
    },
  ]

  const iconSet = [User, GraduationCap, Laptop, Sparkles, Globe, BookOpen, Brain, Calculator, Zap, Target]

  return (
    <div ref={containerRef} className="bg-ink text-canvas-soft selection:bg-primary selection:text-ink font-sans">
      <div className="grain-overlay opacity-[0.02] pointer-events-none" />

      {/* ─── Hero Section ─── */}
      <section ref={heroRef} className="relative h-screen flex flex-col items-center justify-center z-20 overflow-visible px-6">
        <div className="absolute inset-0 pointer-events-none">
          {ORBIT_POSITIONS.map((pos, i) => {
            const Icon = iconSet[i % iconSet.length]
            return (
              <div 
                key={i} 
                className="orbit-element absolute w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-primary backdrop-blur-xl shadow-2xl shadow-primary/5"
                style={{ left: pos.left, top: pos.top, opacity: pos.opacity }}
              >
                <Icon className="w-7 h-7" />
              </div>
            )
          })}
        </div>

        <div className="hero-main-content relative z-10 text-center">
          <div className="overflow-hidden mb-8">
            <h1 className="hero-title text-[15vw] font-black tracking-tighter leading-none flex justify-center">
              {"BIT2BYTE".split("").map((c, i) => (
                <span key={i} className="char inline-block">{c}</span>
              ))}
            </h1>
          </div>
          <p className="text-body-lg md:text-display-sm text-canvas-soft/40 max-w-2xl mx-auto mb-14 font-bold tracking-tight uppercase">
            Unlimited Potential &middot; Rural Edge &middot; High Fidelity
          </p>
          <div className="flex justify-center">
            <Link href="/login">
              <Button variant="primary" size="lg" className="px-8 md:px-16 py-5 md:py-9 h-auto text-lg md:text-2xl rounded-full cursor-pointer shadow-2xl shadow-primary/20 hover:scale-105 transition-all font-black tracking-tighter whitespace-nowrap">
                LAUNCH JOURNEY <ArrowRight className="ml-2 md:ml-3 w-5 h-5 md:w-8 md:h-8" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Manifesto Section (Increased Y-Spacing) ─── */}
      <section className="manifesto-section relative py-32 md:py-80 px-6 z-10 bg-ink">
        <div className="max-w-6xl mx-auto text-center md:text-left">
          <h2 className="text-display-lg md:text-display-xl lg:text-display-mega font-black leading-[1.3] tracking-tighter mb-24 text-white/10">
            {"GEOGRAPHY SHOULD NEVER LIMIT GENIUS. WE EMPOWER THE NEXT BILLION LEARNERS.".split(" ").map((word, i) => (
              <span key={i} className="manifesto-word inline-block mr-4 mb-2 px-2 py-1 rounded-lg transition-all duration-300">
                {word}
              </span>
            ))}
          </h2>
          <div className="mt-10 pt-10 border-t border-white/5">
            <p className="text-body-lg md:text-display-sm text-canvas-soft/30 max-w-3xl leading-relaxed font-bold italic">
              We turn every smartphone into a world-class laboratory. 
              Optimized for low-bandwidth, built for high-impact.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Refined Stacking Cards (Toned Down) ─── */}
      <section className="stack-section relative px-6 pb-[40vh] z-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-[20vh]">
          {subjects.map((sub, i) => (
            <div 
              key={i} 
              className={`stack-card sticky top-[12vh] w-full h-[70vh] bg-surface-card rounded-[56px] border-2 ${sub.border} p-10 md:p-20 flex flex-col md:flex-row gap-16 items-center overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)]`}
              style={{ zIndex: i + 10 }}
            >
              {/* Subtle Ambient Glow */}
              <div className={`absolute -top-40 -right-40 w-96 h-96 blur-[120px] opacity-20 pointer-events-none rounded-full ${sub.bg}`} />
              
              <div className={`w-48 h-48 md:w-80 md:h-80 rounded-[48px] ${sub.bg} flex items-center justify-center ${sub.color} shrink-0 relative overflow-hidden group shadow-inner`}>
                <div className="absolute opacity-15 scale-[5] group-hover:scale-[5.5] transition-transform duration-1000">{sub.icon}</div>
                <div className="relative scale-[3] drop-shadow-2xl">{sub.icon}</div>
              </div>

              <div className="flex-1 text-center md:text-left relative z-10">
                <div className="flex items-center justify-center md:justify-start gap-6 mb-8">
                  <span className={`px-6 py-2 rounded-xl text-xs font-black tracking-widest uppercase ${sub.bg} ${sub.color} border ${sub.border} shadow-lg`}>
                    Unit 0{i + 1}
                  </span>
                  <span className="text-body-xs font-black text-white/20 tracking-[0.3em] uppercase">{sub.hook}</span>
                </div>
                
                <h3 className="text-display-lg md:text-display-xl font-black mb-8 leading-tight text-white drop-shadow-xl">
                  {sub.title}
                </h3>
                <p className="text-body-lg md:text-display-sm text-canvas-soft/40 max-w-xl mb-12 leading-relaxed font-bold italic tracking-tight">
                  &ldquo;{sub.desc}&rdquo;
                </p>
                
                <Link href="/login">
                  <Button className={`rounded-full px-14 py-8 h-auto text-xl font-black uppercase tracking-widest cursor-pointer shadow-2xl transition-all hover:scale-105 active:scale-95 ${sub.bg.replace('/10', '')} text-ink hover:brightness-110 shadow-current/30`}>
                    Explore {sub.name.split(" ")[1]}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="h-screen flex items-center justify-center text-center px-6 bg-primary z-20 relative">
        <div className="max-w-5xl">
          <h2 className="text-display-mega font-black text-ink tracking-tighter leading-[0.8] mb-20">
            TIME TO <br /> EVOLVE.
          </h2>
          <Link href="/login">
            <Button className="bg-ink text-primary hover:bg-ink/90 text-xl md:text-3xl px-10 md:px-24 py-6 md:py-12 h-auto rounded-full font-black uppercase tracking-widest cursor-pointer shadow-2xl transition-transform hover:scale-105 whitespace-nowrap">
              JOIN THE ELITE
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-32 px-6 border-t border-white/5 text-center bg-ink z-10 relative">
        <p className="text-body-sm text-canvas-soft/30 font-black tracking-widest uppercase">
          © 2026 BIT2BYTE &middot; THE FUTURE IS RURAL
        </p>
      </footer>
    </div>
  )
}
