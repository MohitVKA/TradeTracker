import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext'
import { SidebarProvider } from '@/context/SidebarContext'
import { DesktopSidebar, MobileDrawer } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'TradeLog — Professional Trading Journal',
  description: 'Track, analyze, and improve your trading performance',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider>
          <SidebarProvider>
            <div className="flex h-screen overflow-hidden">
              {/* Desktop sidebar */}
              <DesktopSidebar />

              {/* Mobile drawer */}
              <MobileDrawer />

              {/* Main content area */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto">
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
