import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { StockProvider } from '@/context/StockContext'
import { ThemeProvider } from '@/context/ThemeContext'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { ToastProvider } from '@/components/ui/Toast'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Charly HB — Enterprise Stock Management',
  description: 'Enterprise multi-tenant stock and inventory tracking platform',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-orange-500/20 selection:text-orange-500`}>
        <ThemeProvider>
          {/* AuthProvider must be outermost — StockProvider uses useAuth() internally */}
          <AuthProvider>
            <StockProvider>
              <ToastProvider>
                <ErrorBoundary>
                  <LayoutWrapper>
                    {children}
                  </LayoutWrapper>
                </ErrorBoundary>
              </ToastProvider>
            </StockProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
