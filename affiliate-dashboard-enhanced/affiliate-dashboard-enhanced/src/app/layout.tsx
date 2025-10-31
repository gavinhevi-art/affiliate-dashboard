/*
 * Root layout for the affiliate portal
 *
 * This file sets up the global HTML structure for your Next.js app. It
 * includes a persistent sidebar for navigation, a header with a dark mode
 * toggle, and a container for page content. Tailwind utilities provide
 * responsive spacing and coloring. The dark mode toggle persists
 * preference in localStorage and toggles a `dark` class on the `<html>`
 * element.
 */

import './globals.css'
import type { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'
import { Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  // Track dark mode preference in state and sync with localStorage/html class
  const [dark, setDark] = useState(false)

  useEffect(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem('theme')
    if (stored) setDark(stored === 'dark')
  }, [])

  useEffect(() => {
    const html = document.documentElement
    if (dark) {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar />
          {/* Main content area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-neutral-900">
              <h1 className="text-lg font-semibold">Affiliate Dashboard</h1>
              <button
                className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setDark((v) => !v)}
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </header>
            <main className="flex-1 px-6 py-8 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}