"use client"

import {
  Brain,
  BookOpen,
  Globe2,
  Trophy,
  Smartphone,
  Shield,
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Interactive Quizzes",
    description:
      "MCQ-based quizzes with instant feedback and XP rewards. Learn at your own pace with one question at a time.",
  },
  {
    icon: BookOpen,
    title: "Study Materials",
    description:
      "Curated reading guides and materials for every subject. Download as PDF for offline study anytime.",
  },
  {
    icon: Globe2,
    title: "Multilingual",
    description:
      "Google Translate integration lets students learn in their native language. No content duplication needed.",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description:
      "Earn XP points for every quiz completed. Track your progress and stay motivated with friendly competition.",
  },
  {
    icon: Smartphone,
    title: "Low-Bandwidth Ready",
    description:
      "Optimized for rural connectivity. Lightweight pages, offline downloads, and minimal data usage.",
  },
  {
    icon: Shield,
    title: "Secure & Simple",
    description:
      "Firebase authentication with email/password or Google. No complex setup — just sign up and start learning.",
  },
]

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="band-dark-elevated px-6 py-20 md:py-28 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/3 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary/2 blur-[80px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl">
        <div className="text-center mb-16 md:mb-20">
          <span className="feature-chip inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-sm font-semibold text-primary mb-6">
            Why Bit2Byte
          </span>
          <h2 className="feature-headline text-display-md md:text-display-xl font-black text-canvas-soft">
            Everything you need to learn
          </h2>
          <p className="mt-4 text-body-md text-canvas-soft/50 max-w-2xl mx-auto">
            Built for students and teachers in rural schools. No fluff, just the
            tools that matter.
          </p>
        </div>

        <div className="feature-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="feature-card group relative rounded-2xl bg-surface-card border border-primary/5 p-6 md:p-8 transition-all duration-500 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-display-xs font-bold text-canvas-soft mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-body-sm text-canvas-soft/50 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
