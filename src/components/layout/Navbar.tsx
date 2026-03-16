'use client'

import { usePathname } from 'next/navigation'
import { Menu, Sun, Moon } from 'lucide-react'
import { useSidebar } from '@/context/SidebarContext'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

const PAGE_TITLES: Record<string, string> = {
  '/':              'Dashboard',
  '/new-trade':     'New Trade',
  '/trade-history': 'Trade History',
  '/analytics':     'Analytics',
  '/journal':       'Journal',
  '/settings':      'Settings',
}

export function Navbar() {
  const pathname    = usePathname()
  const { openDrawer }     = useSidebar()
  const { theme, toggleTheme } = useTheme()

  const title = PAGE_TITLES[pathname] ?? 'TradeLog'

  return (
    <header
      className={cn(
        'sticky top-0 z-20 h-12 flex items-center px-4 gap-3 md:px-5',
        'bg-raised/90 backdrop-blur-md',
        'border-b border-[hsl(var(--border))]',
      )}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={openDrawer}
        className="btn btn-ghost btn-icon md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Page title */}
      <span className="flex-1 text-sm font-semibold tracking-tight text-fg">
        {title}
      </span>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        className="btn btn-secondary btn-icon"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <span
          key={theme}
          style={{ animation: 'themeToggleSpin 180ms ease-out both' }}
        >
          {theme === 'dark'
            ? <Sun  className="w-[15px] h-[15px]" />
            : <Moon className="w-[15px] h-[15px]" />
          }
        </span>
      </button>
    </header>
  )
}
