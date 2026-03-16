import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext'
import { SidebarProvider } from '@/context/SidebarContext'
import { DesktopSidebar, MobileDrawer } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'TradeLog',
  description: 'Professional trading journal',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SidebarProvider>
            <div className="flex h-screen overflow-hidden" style={{ background: 'hsl(var(--bg))' }}>
              <DesktopSidebar />
              <MobileDrawer />
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto" style={{ background: 'hsl(var(--bg))' }}>
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
