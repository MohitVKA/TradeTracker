'use client'

import { ReactNode, useEffect, useRef } from 'react'

interface PageWrapperProps {
  children:  ReactNode
  className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity    = '0'
    el.style.transform  = 'translateY(8px)'
    void el.offsetHeight
    el.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out'
    el.style.opacity    = '1'
    el.style.transform  = 'translateY(0)'
  }, [])

  return (
    <div
      ref={ref}
      className={`p-4 md:p-6 lg:p-8 max-w-7xl mx-auto ${className}`}
    >
      {children}
    </div>
  )
}
