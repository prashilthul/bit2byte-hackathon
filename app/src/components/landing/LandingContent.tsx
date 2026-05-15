"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "@studio-freight/lenis"
import HeroSection from "./HeroSection"
import FeaturesSection from "./FeaturesSection"
import StatsSection from "./StatsSection"
import CTASection from "./CTASection"
import FooterSection from "./FooterSection"

gsap.registerPlugin(ScrollTrigger)

export default function LandingContent() {
  const mainRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // ─── Lenis smooth scroll ───
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    lenis.on("scroll", ScrollTrigger.update)

    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // ─── Desktop-only animations ───
      mm.add("(min-width: 768px)", () => {
        // Progress bar
        ScrollTrigger.create({
          onUpdate: (self) => {
            if (progressRef.current) {
              gsap.set(progressRef.current, { scaleX: self.progress })
            }
          },
        })

        // Cursor follower with trailing dot
        const cursor = cursorRef.current
        const cursorDot = cursorDotRef.current
        if (cursor && cursorDot) {
          const handleMouse = (e: MouseEvent) => {
            gsap.to(cursor, {
              x: e.clientX,
              y: e.clientY,
              duration: 0.6,
              ease: "power2.out",
            })
            gsap.to(cursorDot, {
              x: e.clientX,
              y: e.clientY,
              duration: 0.15,
              ease: "power2.out",
            })
          }
          window.addEventListener("mousemove", handleMouse)

          // Hide cursor on certain elements
          const handleEnter = () => {
            gsap.to(cursor, { opacity: 0, duration: 0.3, scale: 0 })
            gsap.to(cursorDot, { opacity: 0, duration: 0.3 })
          }
          const handleLeave = () => {
            gsap.to(cursor, { opacity: 1, duration: 0.3, scale: 1 })
            gsap.to(cursorDot, { opacity: 1, duration: 0.3 })
          }

          document.querySelectorAll("a, button, input, select").forEach((el) => {
            el.addEventListener("mouseenter", handleEnter)
            el.addEventListener("mouseleave", handleLeave)
          })

          return () => {
            window.removeEventListener("mousemove", handleMouse)
            document.querySelectorAll("a, button, input, select").forEach((el) => {
              el.removeEventListener("mouseenter", handleEnter)
              el.removeEventListener("mouseleave", handleLeave)
            })
          }
        }

        // Section Pinning for Hero (Depth effect)
        const hero = document.querySelector("section")
        if (hero) {
          gsap.to(hero, {
            scale: 0.95,
            opacity: 0.5,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          })
        }

        // Parallax background layers (Multi-speed)
        const bgLayers = document.querySelectorAll(".hero-bg-layers > div")
        bgLayers.forEach((layer, i) => {
          gsap.to(layer, {
            y: (i + 1) * 40,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero-bg-layers",
              start: "top top",
              end: "bottom top",
              scrub: 1 + i * 0.5,
            },
          })
        })
      })

      // ─── Hero pill entrance ───
      const heroPill = document.querySelector(".hero-pill")
      if (heroPill) {
        gsap.from(heroPill, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        })
      }

      // ─── Hero split text reveal (line by line with stagger + clip) ───
      const heroLines = document.querySelectorAll(".hero-line")
      if (heroLines.length) {
        heroLines.forEach((line) => {
          // Wrap each word in a span for word-level animation
          const text = line.textContent || ""
          const words = text.split(" ")
          line.innerHTML = words
            .map((word) => `<span class="inline-block overflow-hidden"><span class="hero-word inline-block">${word}</span></span>`)
            .join(" ")
        })

        const heroWords = document.querySelectorAll(".hero-word")
        gsap.from(heroWords, {
          y: "110%",
          rotateX: -40,
          rotateY: 10,
          skewY: 7,
          stagger: {
            amount: 0.4,
            from: "start",
          },
          duration: 1.2,
          ease: "expo.out",
        })

        // Add a secondary stagger from the second line
        const secondLineWords = document.querySelectorAll(".hero-line:nth-child(2) .hero-word")
        if (secondLineWords.length) {
          gsap.from(secondLineWords, {
            color: "#9fe870",
            duration: 1.5,
            delay: 0.8,
            ease: "power2.out",
          })
        }
      }

      // ── Hero subtitle stagger ──
      const heroSubtitle = document.querySelector(".hero-subtitle")
      if (heroSubtitle) {
        gsap.from(heroSubtitle, {
          y: 40,
          opacity: 0,
          duration: 1,
          delay: 0.3,
          ease: "power3.out",
        })
      }

      // ── Hero CTA buttons stagger ──
      const heroCta = document.querySelector(".hero-cta")
      if (heroCta) {
        gsap.from(heroCta.children, {
          y: 40,
          opacity: 0,
          stagger: 0.15,
          duration: 0.8,
          delay: 0.5,
          ease: "power3.out",
        })
      }

      // ── Hero visual stagger ──
      const heroVisual = document.querySelector(".hero-visual")
      if (heroVisual) {
        gsap.from(heroVisual, {
          scale: 0.7,
          opacity: 0,
          duration: 1.2,
          delay: 0.4,
          ease: "power4.out",
        })
      }

      const iconTiles = document.querySelectorAll(".icon-tile")
      if (iconTiles.length) {
        gsap.from(iconTiles, {
          scale: 0,
          opacity: 0,
          rotate: -15,
          stagger: 0.12,
          duration: 0.7,
          delay: 0.8,
          ease: "back.out(2)",
        })
      }

      // ─── Feature section reveal ───
      const featureChip = document.querySelector(".feature-chip")
      if (featureChip) {
        gsap.from(featureChip, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featureChip,
            start: "top 85%",
          },
        })
      }

      const featureHeadline = document.querySelector(".feature-headline")
      if (featureHeadline) {
        gsap.from(featureHeadline, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featureHeadline,
            start: "top 80%",
          },
        })
      }

      // ─── Feature cards: 3D perspective reveal ───
      const featureCards = document.querySelectorAll(".feature-card")
      if (featureCards.length) {
        gsap.from(featureCards, {
          y: 80,
          opacity: 0,
          scale: 0.9,
          rotateX: 10,
          transformOrigin: "50% 100%",
          stagger: 0.1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".feature-grid",
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        })

        // 3D tilt on hover
        featureCards.forEach((card) => {
          card.addEventListener("mousemove", (e: Event) => {
            const ev = e as MouseEvent
            const rect = (card as HTMLElement).getBoundingClientRect()
            const x = (ev.clientX - rect.left) / rect.width - 0.5
            const y = (ev.clientY - rect.top) / rect.height - 0.5
            
            gsap.to(card, {
              rotateY: x * 10,
              rotateX: -y * 10,
              duration: 0.6,
              ease: "power2.out",
            })

            // Update glow position if it exists
            const glow = (card as HTMLElement).querySelector(".card-glow")
            if (glow) {
              gsap.to(glow, {
                x: ev.clientX - rect.left,
                y: ev.clientY - rect.top,
                duration: 0.2,
                ease: "power1.out",
              })
            }
          })

          card.addEventListener("mouseleave", () => {
            gsap.to(card, {
              rotateY: 0,
              rotateX: 0,
              duration: 0.8,
              ease: "elastic.out(1, 0.5)",
            })
          })
        })
      }

      // ─── Stats count-up with smoother easing ───
      const statNumbers = document.querySelectorAll(".stat-number")
      if (statNumbers.length) {
        statNumbers.forEach((el) => {
          const text = el.textContent || ""
          const numMatch = text.match(/[\d,]+/)
          const target = numMatch ? parseInt(numMatch[0].replace(/,/g, "")) : 0

          gsap.fromTo(
            el,
            { innerText: 0 },
            {
              innerText: target,
              duration: 2.5,
              ease: "power2.out",
              snap: { innerText: 1 },
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          )
        })

        // Stagger the stat items entrance
        const statItems = document.querySelectorAll(".stat-item")
        gsap.from(statItems, {
          y: 60,
          opacity: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".stats-grid",
            start: "top 80%",
          },
        })
      }

      const statsHeadline = document.querySelector(".stats-headline")
      if (statsHeadline) {
        gsap.from(statsHeadline, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: statsHeadline,
            start: "top 85%",
          },
        })
      }

      // ─── CTA section reveal ───
      const ctaHeadline = document.querySelector(".cta-headline")
      if (ctaHeadline) {
        gsap.from(ctaHeadline, {
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaHeadline,
            start: "top 85%",
          },
        })

        // Wrap "learning?" in its own span for highlight
        const ctaText = ctaHeadline.textContent || ""
        if (ctaText.includes("learning?")) {
          ctaHeadline.innerHTML = ctaText.replace(
            "learning?",
            '<span class="text-primary">learning?</span>'
          )
        }
      }

      const ctaText = document.querySelector(".cta-text")
      if (ctaText) {
        gsap.from(ctaText, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          delay: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaText,
            start: "top 85%",
          },
        })
      }

      const ctaButton = document.querySelector(".cta-button")
      if (ctaButton) {
        gsap.from(ctaButton, {
          y: 40,
          opacity: 0,
          scale: 0.9,
          duration: 0.8,
          delay: 0.3,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ctaButton,
            start: "top 85%",
          },
        })
      }

      // ─── Footer reveal ───
      const footer = document.querySelector(".footer")
      if (footer) {
        gsap.from(footer, {
          y: 100,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footer,
            start: "top 95%",
          },
        })
      }

      // ─── Footer heading + link staggers ───
      const footerHeadings = document.querySelectorAll(".footer-heading")
      if (footerHeadings.length) {
        gsap.from(footerHeadings, {
          y: 20,
          opacity: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footer,
            start: "top 90%",
          },
        })
      }

      // ─── Magnetic hover on buttons AND nav links + Logo ───
      document.querySelectorAll(".magnetic-btn, nav a, nav button:not(.md\\:hidden)").forEach((btn) => {
        const handleMove = (e: Event) => {
          const ev = e as MouseEvent
          const rect = (btn as HTMLElement).getBoundingClientRect()
          const x = ev.clientX - rect.left - rect.width / 2
          const y = ev.clientY - rect.top - rect.height / 2
          
          // Navigation links move less than buttons, logo moves even less
          let intensity = 0.35
          if (btn.tagName === "A" && btn.textContent === "BIT2BYTE") intensity = 0.15
          else if (!btn.classList.contains("magnetic-btn")) intensity = 0.25
          
          gsap.to(btn, {
            x: x * intensity,
            y: y * intensity,
            scale: btn.classList.contains("magnetic-btn") ? 1.07 : 1,
            duration: 0.6,
            ease: "power2.out",
          })
        }
        const handleLeave = () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
          })
        }
        btn.addEventListener("mousemove", handleMove)
        btn.addEventListener("mouseleave", handleLeave)
      })

      // ─── Refresh ScrollTrigger after Lenis init ───
      ScrollTrigger.refresh()
    }, mainRef)

    return () => {
      ctx.revert()
      lenis.destroy()
      gsap.ticker.remove(() => {})
    }
  }, [])

  return (
    <>
      {/* Scroll Progress Bar */}
      <div
        ref={progressRef}
        className="fixed top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-primary-active to-primary origin-left z-[100] scale-x-0 will-change-transform"
      />

      {/* Custom Cursor Ring */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[99] hidden md:flex items-center justify-center w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm will-change-transform"
      >
        <div
          ref={cursorDotRef}
          className="w-1.5 h-1.5 rounded-full bg-primary"
        />
      </div>

      {/* Grain Overlay */}
      <div className="grain-overlay" />

      <div ref={mainRef}>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <CTASection />
        <FooterSection />
      </div>
    </>
  )
}
