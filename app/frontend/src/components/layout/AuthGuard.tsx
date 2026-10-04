'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const PUBLIC_ROUTES = ['/login', '/register', '/login/', '/register/']

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || PUBLIC_ROUTES.includes(pathname.replace(/\/$/, ''))

  useEffect(() => {
    if (loading) return

    // Not logged in and trying to access a protected page
    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login')
    }

    // Already logged in and trying to access login/register
    if (isAuthenticated && isPublicRoute) {
      router.replace('/')
    }
  }, [isAuthenticated, loading, pathname])

  // Show loading screen while auth state is being read from localStorage
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-[#ff3d00] rounded-lg flex items-center justify-center animate-pulse shadow-sm">
            <span className="text-white text-lg font-medium">C</span>
          </div>
          <p className="text-xs font-medium text-[#60646c] dark:text-slate-400">Loading workspace...</p>
        </div>
      </div>
    )
  }

  // Render public routes (login/register) always
  if (isPublicRoute) {
    // If already logged in, show nothing while redirect happens
    if (isAuthenticated) return null
    return <>{children}</>
  }

  // For protected routes, only render if authenticated
  if (!isAuthenticated) return null

  return <>{children}</>
}
