// BottomNav — Fixed bottom navigation with 4 primary tabs + More sheet with theme styling
'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import MoreSheet from './MoreSheet'
import { PackageIcon, AlertTriangleIcon } from '@/components/ui/Icons'

interface BottomNavProps {
  pendingSpoilsCount?: number
}

export default function BottomNav({ pendingSpoilsCount = 0 }: BottomNavProps) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  // Pages that live inside the More sheet
  const morePages = ['/shops', '/reports', '/about', '/profile']
  const moreIsActive = morePages.includes(pathname)

  const tabs = [
    {
      href: '/',
      label: 'Home',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/movements',
      label: 'Movements',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      href: '/products',
      label: 'Products',
      icon: <PackageIcon size={20} />,
    },
    {
      href: '/spoils',
      label: 'Spoils',
      badge: pendingSpoilsCount > 0,
      icon: <AlertTriangleIcon size={20} />,
    },
  ]

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 transition-colors">
        <div className="flex justify-around items-center py-1.5 px-1 max-w-lg mx-auto">

          {/* Primary tabs */}
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center py-1.5 px-2 flex-1 relative transition-colors ${
                  isActive
                    ? 'text-orange-500 font-semibold'
                    : 'text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
              >
                <div className="relative">
                  {tab.icon}
                  {tab.badge && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-[11px] mt-1 truncate w-full text-center">{tab.label}</span>
              </Link>
            )
          })}

          {/* More tab */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-2 flex-1 transition-colors ${
              moreIsActive
                ? 'text-orange-500 font-semibold'
                : 'text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-[11px] mt-1">More</span>
          </button>

        </div>
      </nav>

      {/* More sheet */}
      <MoreSheet isOpen={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  )
}
