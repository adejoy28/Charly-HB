// MoreSheet.tsx — Bottom sheet opened by the "More" tab in BottomNav with Dark/Light theme
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MoreSheetProps {
  isOpen: boolean
  onClose: () => void
}

export default function MoreSheet({ isOpen, onClose }: MoreSheetProps) {
  const pathname = usePathname()

  const items = [
    {
      href: '/shops',
      label: 'Shops & Branches',
      description: 'Manage delivery destinations and shop balances',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      href: '/reports',
      label: 'Reports & Audits',
      description: 'View period summaries, stock velocity and ledger exports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      href: '/profile',
      label: 'User Profile & Settings',
      description: 'Update password, active sessions and preferences',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 rounded-t-3xl transition-colors duration-150 animate-in slide-in-from-bottom duration-200">
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-2" />

        {/* Title */}
        <div className="flex items-center justify-between px-5 pt-1 pb-2 border-b border-gray-100 dark:border-slate-800">
          <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
            Workspace Navigation
          </p>
          <button onClick={onClose} className="text-xs text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-white">
            Close
          </button>
        </div>

        {/* Items */}
        <div className="pb-8 pt-2">
          {items.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                  isActive ? 'bg-orange-50/50 dark:bg-orange-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                } ${index < items.length - 1 ? 'border-b border-gray-100 dark:border-slate-800/60' : ''}`}
              >
                {/* Icon container */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive 
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {item.icon}
                </div>

                {/* Label + description */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                </div>

                {/* Chevron */}
                <svg className="w-4 h-4 text-gray-300 dark:text-slate-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
