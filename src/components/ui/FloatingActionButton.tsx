'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

export function FloatingActionButton() {
  return (
    <Link
      href="/new-trade"
      aria-label="Add new trade"
      className={[
        'fixed bottom-6 right-5 z-30 md:hidden',
        'w-14 h-14 rounded-full bg-primary text-primary-foreground',
        'flex items-center justify-center shadow-lg',
        'transition-all duration-150 active:scale-95',
        'hover:scale-105',
      ].join(' ')}
    >
      <Plus className="w-6 h-6" strokeWidth={2.5} />
    </Link>
  )
}
