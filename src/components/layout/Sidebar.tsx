'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, PlusCircle, BookOpen,
  BarChart3, Brain, Settings, TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/',              label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/new-trade',     label: 'New Trade',    icon: PlusCircle },
  { href: '/trade-history', label: 'History',      icon: BookOpen },
  { href: '/analytics',     label: 'Analytics',    icon: BarChart3 },
  { href: '/journal',       label: 'Journal',      icon: Brain },
  { href: '/settings',      label: 'Settings',     icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex flex-col border-r border-border bg-card shrink-0 h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="font-bold text-foreground text-sm tracking-wide">TradeLog</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Pro Journal</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-primary' : '')} />
              {label}
              {href === '/new-trade' && !active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary/60" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <div className="text-[11px] text-muted-foreground/60 text-center">
          Data stored locally
        </div>
      </div>
    </aside>
  )
}
