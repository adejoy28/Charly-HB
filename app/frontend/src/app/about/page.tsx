// about/page.tsx — Enterprise Application Information & System Environment Details
// Features: Platform Build Metadata, Active Identity, Architecture Specs, Dark/Light Mode

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
    <div className="space-y-6 max-w-2xl pb-16 animate-in fade-in duration-300">
      
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          System & Workspace Information
        </h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Charly HB enterprise ledger engine specifications and active tenant credentials.
        </p>
      </div>

      {/* ── App Info ── */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider">
          Platform Architecture
        </h3>
        <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-none transition-colors divide-y divide-neutral-100 dark:divide-slate-800">
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs font-medium text-[#60646c] dark:text-slate-400">Application</span>
            <span className="text-xs font-medium text-gray-900 dark:text-white">Charly HB Inventory Engine</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs font-medium text-[#60646c] dark:text-slate-400">Version</span>
            <span className="text-xs font-mono font-medium text-[#ff3d00]">v2.4.0 (Enterprise)</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs font-medium text-[#60646c] dark:text-slate-400">Ledger Protocol</span>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">Real-Time Event Audit</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs font-medium text-[#60646c] dark:text-slate-400">PWA Offline Mode</span>
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Enabled</span>
          </div>
        </div>
      </div>

      {/* ── Account Info ── */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider">
          Active Session Identity
        </h3>
        <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-none transition-colors divide-y divide-neutral-100 dark:divide-slate-800">
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs font-medium text-[#60646c] dark:text-slate-400">Operator Name</span>
            <span className="text-xs font-medium text-gray-900 dark:text-white truncate ml-3">{user?.name}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs font-medium text-[#60646c] dark:text-slate-400">Identifier</span>
            <span className="text-xs font-mono text-gray-700 dark:text-slate-300 truncate ml-3">
              {user?.email || user?.username || user?.phone || '—'}
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs font-medium text-[#60646c] dark:text-slate-400">Access Scope</span>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">Full Workspace Read/Write</span>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="space-y-3 pt-2">
        <Link
          href="/"
          className="flex items-center justify-center w-full h-10 min-h-[40px] bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-700 text-gray-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-slate-800 text-sm font-medium rounded-lg active:scale-[0.98] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
        >
          Return to Ledger Dashboard
        </Link>

        <button
          onClick={handleLogout}
          className="w-full h-10 min-h-[40px] border border-[#d92d20] text-[#d92d20] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-sm font-medium rounded-lg active:scale-[0.98] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d92d20]"
        >
          Sign Out of Workspace
        </button>
      </div>

      {/* ── Footer ── */}
      <div className="text-center pt-4">
        <p className="text-xs text-gray-400 dark:text-slate-500 font-mono">
          © 2026 Charly HB. All rights reserved.
        </p>
      </div>
    </div>
  )
}
