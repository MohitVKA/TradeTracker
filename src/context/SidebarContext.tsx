'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextValue {
  isOpen: boolean       // mobile drawer open state
  isCollapsed: boolean  // desktop collapsed icon-only state
  openDrawer: () => void
  closeDrawer: () => void
  toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  isOpen: false,
  isCollapsed: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleCollapsed: () => {},
})

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Close drawer on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setIsOpen(false)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <SidebarContext.Provider value={{
      isOpen,
      isCollapsed,
      openDrawer: () => setIsOpen(true),
      closeDrawer: () => setIsOpen(false),
      toggleCollapsed: () => setIsCollapsed(c => !c),
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
