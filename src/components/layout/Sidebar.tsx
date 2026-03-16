'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, PlusCircle, BookOpen,
  BarChart3, Brain, Settings, TrendingUp,
  ChevronsLeft, ChevronsRight, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/context/SidebarContext'

const navItems = [
  { href: '/',              label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/new-trade',     label: 'New Trade',   icon: PlusCircle, accent: true },
  { href: '/trade-history', label: 'History',     icon: BookOpen },
  { href: '/analytics',     label: 'Analytics',   icon: BarChart3 },
  { href: '/journal',       label: 'Journal',     icon: Brain },
  { href: '/settings',      label: 'Settings',    icon: Settings },
]

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()
  const { isCollapsed, toggleCollapsed } = useSidebar()

  return (
    <div className={cn(
      'flex flex-col h-full bg-card border-r border-border transition-all duration-200 ease-out',
      isCollapsed ? 'w-14' : 'w-56'
    )}>
      {/* Logo row */}
      <div className={cn(
        'flex items-center border-b border-border shrink-0',
        isCollapsed ? 'justify-center px-0 h-14' : 'gap-2.5 px-4 h-14'
      )}>
        <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <div className="font-semibold text-foreground text-sm leading-tight tracking-tight">TradeLog</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.12em] leading-tight">Pro Journal</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn('flex-1 py-3 space-y-0.5 overflow-y-auto', isCollapsed ? 'px-1.5' : 'px-2')}>
        {navItems.map(({ href, label, icon: Icon, accent }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              title={isCollapsed ? label : undefined}
              className={cn(
                'flex items-center rounded-md text-sm font-medium transition-all duration-150 group relative',
                isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-2.5 px-3 py-2',
                active
                  ? 'bg-primary/12 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className={cn('shrink-0', isCollapsed ? 'w-[18px] h-[18px]' : 'w-4 h-4',
                active ? 'text-primary' : ''
              )} />
              {!isCollapsed && (
                <>
                  <span className="truncate">{label}</span>
                  {accent && !active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                  )}
                </>
              )}
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <span className="absolute left-full ml-2.5 px-2 py-1 rounded-md bg-popover border border-border text-xs text-foreground whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-50">
                  {label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="hidden md:block border-t border-border p-2">
        <button
          onClick={toggleCollapsed}
          className={cn(
            'flex items-center rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150',
            isCollapsed ? 'w-10 h-8 justify-center mx-auto' : 'w-full px-3 py-2 gap-2'
          )}
        >
          {isCollapsed
            ? <ChevronsRight className="w-3.5 h-3.5" />
            : <><ChevronsLeft className="w-3.5 h-3.5" /><span>Collapse</span></>
          }
        </button>
      </div>

      {!isCollapsed && (
        <div className="px-4 pb-3 hidden md:block">
          <div className="text-[10px] text-muted-foreground/50 text-center leading-relaxed">
            All data stored locally
          </div>
        </div>
      )}
    </div>
  )
}

/* Desktop sidebar — always visible */
export function DesktopSidebar() {
  return (
    <aside className="hidden md:flex shrink-0 h-screen sticky top-0">
      <SidebarContent />
    </aside>
  )
}

/* Mobile drawer — slides in over content */
export function MobileDrawer() {
  const { isOpen, closeDrawer } = useSidebar()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="drawer-backdrop md:hidden"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full md:hidden transition-transform duration-200 ease-out shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Navigation"
      >
        {/* Close button overlay */}
        <button
          onClick={closeDrawer}
          className="absolute top-3.5 right-3 z-50 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent onLinkClick={closeDrawer} />
      </aside>
    </>
  )
}
