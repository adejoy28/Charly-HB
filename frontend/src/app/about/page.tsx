'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AboutPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* App Info */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Application
        </h3>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
            <span className="text-sm text-gray-600">App Name</span>
            <span className="text-sm font-medium text-gray-900">Charly HB</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm text-gray-600">Version</span>
            <span className="text-sm font-medium text-gray-900">1.0.0</span>
          </div>
        </div>
      </div>

      {/* Logged in as */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Account
        </h3>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
            <span className="text-sm text-gray-600">Name</span>
            <span className="text-sm font-medium text-gray-900 truncate ml-3">{user?.name}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm text-gray-600">Login</span>
            <span className="text-sm font-medium text-gray-900 truncate ml-3">
              {user?.email || user?.username || user?.phone || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href="/"
          className="block w-full h-12 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl text-center leading-[48px] active:opacity-70"
        >
          Back to Dashboard
        </Link>

        <button
          onClick={handleLogout}
          className="w-full h-12 border-2 border-red-200 text-red-500 text-sm font-semibold rounded-xl active:opacity-70"
        >
          Sign Out
        </button>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400">
          © 2026 Charly HB. All rights reserved.
        </p>
      </div>
    </div>
  )
}
