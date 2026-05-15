/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { ToastProvider } from "@/context/ToastContext"
import { ConfirmProvider } from "@/components/ui/confirm"
import NavBar from "@/components/NavBar"
import Toaster from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Bit2Byte — STEM Learning Platform",
  description:
    "A gamified web platform for grades 6–12 in rural schools. Interactive quizzes, study materials, and multilingual support.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ink font-sans text-canvas-soft antialiased">
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <NavBar />
              <main className="overflow-x-hidden">{children}</main>
              <Toaster />
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
