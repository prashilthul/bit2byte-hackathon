"use client"

import Link from "next/link"

export default function FooterSection() {
  return (
    <footer className="footer band-dark px-6 py-16 md:py-20 relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="text-2xl font-black tracking-tighter text-primary"
            >
              BIT2BYTE
            </Link>
            <p className="mt-4 text-body-sm text-canvas-soft/40 max-w-xs leading-relaxed">
              Making STEM education accessible for every student, everywhere.
            </p>
          </div>

          <div>
            <h4 className="footer-heading text-body-sm text-canvas-soft/30 font-semibold uppercase tracking-[0.12em] mb-5">
              Platform
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/login"
                  className="text-body-sm text-canvas-soft/50 hover:text-primary transition-colors duration-200"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="text-body-sm text-canvas-soft/50 hover:text-primary transition-colors duration-200"
                >
                  Features
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading text-body-sm text-canvas-soft/30 font-semibold uppercase tracking-[0.12em] mb-5">
              Subjects
            </h4>
            <ul className="space-y-3">
              <li>
                <span className="text-body-sm text-canvas-soft/50">
                  Mathematics
                </span>
              </li>
              <li>
                <span className="text-body-sm text-canvas-soft/50">
                  Science
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading text-body-sm text-canvas-soft/30 font-semibold uppercase tracking-[0.12em] mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <span className="text-body-sm text-canvas-soft/50">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-body-sm text-canvas-soft/50">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-canvas-soft/5 text-center">
          <p className="text-body-sm text-canvas-soft/25">
            &copy; {new Date().getFullYear()} Bit2Byte. Made for rural
            education.
          </p>
        </div>
      </div>
    </footer>
  )
}
