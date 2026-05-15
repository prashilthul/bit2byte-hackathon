"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-ink px-6 pt-20 pb-24 md:pt-28 md:pb-32 lg:pt-36 lg:pb-40">
      {/* Parallax background layers */}
      <div className="hero-bg-layers absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-primary/8 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[120px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(159,232,112,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(159,232,112,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:gap-20">
          <div className="flex-1 max-w-2xl">
            {/* Pill badge */}
            <div className="hero-pill inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-8">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Empowering rural classrooms
            </div>

            {/* Headline with split-text structure */}
            <h1 className="hero-headline">
              <span className="hero-line block text-display-xl md:text-display-xxl lg:text-display-mega font-black tracking-tighter leading-[0.85] text-canvas-soft">
                Learn STEM.
              </span>
              <span className="hero-line block text-display-xl md:text-display-xxl lg:text-display-mega font-black tracking-tighter leading-[0.85] mt-2">
                <span className="text-shimmer">Anywhere.</span>
              </span>
            </h1>

            <p className="hero-subtitle mt-6 text-body text-lg md:text-body-lg max-w-lg mx-auto lg:mx-0 leading-relaxed text-canvas-soft/60">
              A gamified learning platform for grades 6–12. Interactive quizzes,
              study materials, and multilingual support — designed for rural
              schools with low-bandwidth in mind.
            </p>

            <div className="hero-cta mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/login">
                <Button
                  variant="primary"
                  size="lg"
                  className="hero-btn-primary w-full sm:w-auto text-base px-8 py-4 h-auto cursor-pointer magnetic-btn"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="tertiary"
                  size="lg"
                  className="hero-btn-secondary w-full sm:w-auto text-base px-8 py-4 h-auto border-canvas-soft/20 text-canvas-soft hover:bg-canvas-soft/5 cursor-pointer"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual right side */}
          <div className="hero-visual mt-16 lg:mt-0 flex-1 flex justify-center">
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-[60px] animate-pulse" />

              {/* Floating tiles */}
              <div className="relative flex items-center justify-center w-full h-full">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: "📐", delay: "float" },
                    { icon: "🔬", delay: "float-delayed" },
                    { icon: "💻", delay: "" },
                    { icon: "📚", delay: "float-delayed" },
                  ].map((item) => (
                    <div
                      key={item.icon}
                      className={`icon-tile w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-surface-card border border-primary/10 flex items-center justify-center text-3xl md:text-4xl shadow-lg shadow-black/20 ${item.delay}`}
                    >
                      {item.icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
