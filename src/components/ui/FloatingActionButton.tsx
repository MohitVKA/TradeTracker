'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

export function FloatingActionButton() {
  return (
    <Link
      href="/new-trade"
      aria-label="Add new trade"
      className="fixed bottom-6 right-5 z-30 md:hidden w-13 h-13 rounded-full flex items-center justify-center shadow-xl transition-all duration-150 active:scale-95 hover:scale-105"
      style={{
        width: 52, height: 52,
        background: 'hsl(var(--fg))',
        color: 'hsl(var(--bg))',
        boxShadow: '0 4px 20px hsl(0 0% 0% / 0.4)',
      }}
    >
      <Plus className="w-5 h-5" strokeWidth={2.5} />
    </Link>
  )
}
