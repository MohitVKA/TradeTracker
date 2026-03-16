'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, PlusCircle, BookOpen,
  BarChart3, Brain, Settings, TrendingUp,
  ChevronsLeft, ChevronsRight, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/context/SidebarContext'

const navItems = [
  { href: '/',              label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/new-trade',     label: 'New Trade',  icon: PlusCircle, cta: true },
  { href: '/trade-history', label: 'History',    icon: BookOpen },
  { href: '/analytics',     label: 'Analytics',  icon: BarChart3 },
  { href: '/journal',       label: 'Journal',    icon: Brain },
  { href: '/settings',      label: 'Settings',   icon: Settings },
]

function NavItem({
  href, label, icon: Icon, cta, collapsed, onClick,
}: {
  href: string; label: string; icon: any; cta?: boolean
  collapsed: boolean; onClick?: () => void
}) {
  const pathname = usePathname()
  const active   = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        'group relative flex items-center rounded-md text-[13px] font-medium',
        'transition-all duration-150 select-none',
        collapsed
          ? 'justify-center w-9 h-9 mx-auto'
          : 'gap-2.5 px-3 h-9',
        active
          ? 'bg-[hsl(var(--bg-overlay))] text-[hsl(var(--fg))]'
          : 'text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))] hover:bg-[hsl(var(--bg-overlay))]',
      )}
    >
      {/* Active indicator bar */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[hsl(var(--fg))]" />
      )}

      <Icon
        className={cn('shrink-0', collapsed ? 'w-[17px] h-[17px]' : 'w-[15px] h-[15px]')}
        strokeWidth={active ? 2.2 : 1.8}
      />

      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {/* CTA dot for New Trade */}
          {cta && !active && (
            <span className="w-1 h-1 rounded-full bg-[hsl(var(--fg-muted))]" />
          )}
        </>
      )}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <span className={cn(
          'pointer-events-none absolute left-full ml-3 z-50',
          'px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap',
          'bg-[hsl(var(--bg-raised))] border border-[hsl(var(--border))]',
          'text-[hsl(var(--fg))] shadow-lg',
          'opacity-0 translate-x-1',
          'group-hover:opacity-100 group-hover:translate-x-0',
          'transition-all duration-150',
        )}>
          {label}
        </span>
      )}
    </Link>
  )
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const { isCollapsed, toggleCollapsed } = useSidebar()

  return (
    <div
      className={cn(
        'flex flex-col h-full border-r transition-all duration-200 ease-out',
        'bg-[hsl(var(--bg-subtle))] border-[hsl(var(--border))]',
        isCollapsed ? 'w-[56px]' : 'w-[220px]',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-12 shrink-0 border-b border-[hsl(var(--border))]',
        isCollapsed ? 'justify-center' : 'gap-2.5 px-4',
      )}>
        <div className="w-6 h-6 rounded-md bg-[hsl(var(--fg))] flex items-center justify-center shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-[hsl(var(--bg))]" strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <div>
            <div className="text-[13px] font-semibold text-[hsl(var(--fg))] leading-tight tracking-tight">
              TradeLog
            </div>
            <div className="text-[10px] text-[hsl(var(--fg-subtle))] uppercase tracking-[0.12em] leading-tight">
              Journal
            </div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className={cn(
        'flex-1 overflow-y-auto py-3 space-y-0.5',
        isCollapsed ? 'px-[9px]' : 'px-2',
      )}>
        {navItems.map(item => (
          <NavItem
            key={item.href}
            {...item}
            collapsed={isCollapsed}
            onClick={onLinkClick}
          />
        ))}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="hidden md:block border-t border-[hsl(var(--border))] p-2">
        <button
          onClick={toggleCollapsed}
          className={cn(
            'flex items-center rounded-md text-[12px] text-[hsl(var(--fg-muted))]',
            'hover:text-[hsl(var(--fg))] hover:bg-[hsl(var(--bg-overlay))]',
            'transition-all duration-150',
            isCollapsed ? 'w-9 h-9 justify-center mx-auto' : 'w-full px-3 h-9 gap-2',
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed
            ? <ChevronsRight className="w-3.5 h-3.5" />
            : <><ChevronsLeft className="w-3.5 h-3.5" /><span>Collapse</span></>
          }
        </button>
      </div>
    </div>
  )
}

export function DesktopSidebar() {
  return (
    <aside className="hidden md:flex shrink-0 h-screen sticky top-0">
      <SidebarContent />
    </aside>
  )
}

export function MobileDrawer() {
  const { isOpen, closeDrawer } = useSidebar()

  return (
    <>
      {isOpen && (
        <div
          className="drawer-backdrop md:hidden"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full md:hidden shadow-2xl',
          'transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Navigation"
      >
        <button
          onClick={closeDrawer}
          className="btn btn-ghost btn-icon absolute top-2.5 right-2 z-50"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent onLinkClick={closeDrawer} />
      </aside>
    </>
  )
}
