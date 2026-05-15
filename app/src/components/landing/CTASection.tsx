"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CTASection() {
  return (
    <section className="band-dark-elevated px-6 py-20 md:py-28 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] pointer-events-none glow-pulse" />

      <div className="relative mx-auto max-w-4xl text-center">
        <h2 className="cta-headline text-display-md md:text-display-xl font-black text-canvas-soft">
          Ready to start{" "}
          <span className="text-primary">learning?</span>
        </h2>
        <p className="cta-text mt-4 text-body-md text-canvas-soft/50 max-w-xl mx-auto">
          Join thousands of students across rural schools. Free to get started
          — no credit card needed.
        </p>
        <div className="cta-button mt-10">
          <Link href="/login">
            <Button
              variant="primary"
              size="lg"
              className="hero-btn-primary text-base px-10 py-4 h-auto text-lg cursor-pointer magnetic-btn shadow-lg shadow-primary/20"
            >
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
