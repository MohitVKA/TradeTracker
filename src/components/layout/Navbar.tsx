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
  const pathname = usePathname()
  const { openDrawer } = useSidebar()
  const { theme, toggleTheme } = useTheme()

  const title = PAGE_TITLES[pathname] ?? 'TradeLog'

  return (
    <header className="sticky top-0 z-20 h-14 flex items-center px-4 gap-3 bg-card/80 backdrop-blur-md border-b border-border md:px-6">
      {/* Hamburger — mobile only */}
      <button
        onClick={openDrawer}
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Page title */}
      <h1 className="flex-1 text-sm font-semibold text-foreground tracking-tight md:text-base">
        {title}
      </h1>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150',
          'text-muted-foreground hover:text-foreground hover:bg-accent',
          'active:scale-95'
        )}
      >
        {theme === 'dark'
          ? <Sun className="w-4 h-4" />
          : <Moon className="w-4 h-4" />
        }
      </button>
    </header>
  )
}
