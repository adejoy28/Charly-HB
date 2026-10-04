'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { PackageIcon, BarChartIcon, AlertTriangleIcon } from '@/components/ui/Icons'

interface SideNavProps {
  onAction: (actionId: string) => void
  pendingSpoilsCount?: number
  onCollapseChange?: (collapsed: boolean) => void
}

// ── Navigation pages ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    href: '/',
    label: 'Dashboard',
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
    href: '/shops',
    label: 'Shops & Branches',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: '/spoils',
    label: 'Spoils Queue',
    badge: true,
    icon: <AlertTriangleIcon size={20} />,
  },
  {
    href: '/reports',
    label: 'Reports & Audit',
    icon: <BarChartIcon size={20} />,
  },
]

// ── Quick operational actions ──────────────────────────────────────────────
const RECORD_ACTIONS = [
  { id: 'opening',      label: 'Opening Stock',  tag: 'SET', dot: 'bg-blue-500' },
  { id: 'receipt',      label: 'Receive Goods',  tag: 'IN',  dot: 'bg-emerald-500' },
  { id: 'distribution', label: 'Distribute',     tag: 'OUT', dot: 'bg-orange-500' },
  { id: 'spoil',        label: 'Record Spoil',   tag: 'BAD', dot: 'bg-rose-500' },
  { id: 'correction',   label: 'Correction',     tag: 'ADJ', dot: 'bg-purple-500' },
]

export default function SideNav({
  onAction,
  pendingSpoilsCount = 0,
  onCollapseChange,
}: SideNavProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    onCollapseChange?.(next)
  }

  // Normalise pathname
  const normPath = pathname.replace(/\/$/, '') || '/'

  return (
    <aside
      className={`
        hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40
        bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800
        transition-all duration-300 ease-in-out
        w-16
        ${collapsed ? 'lg:w-16' : 'lg:w-60'}
      `}
    >
      {/* ── Header: Brand Logo & Title ── */}
      <div className="flex items-center h-16 border-b border-gray-100 dark:border-slate-800/80 px-3.5 shrink-0">
        <div className="w-9 h-9 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-xl flex items-center justify-center shadow-sm shadow-orange-500/20 shrink-0">
          <span className="text-white text-base font-extrabold tracking-wider">C</span>
        </div>

        {/* App name — desktop expanded */}
        {!collapsed && (
          <div className="hidden lg:flex flex-col ml-3 min-w-0 flex-1">
            <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white truncate">
              charly<span className="text-orange-500">HB</span>
            </span>
            <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              Enterprise Stock
            </span>
          </div>
        )}

        {/* Collapse toggle button */}
        <button
          onClick={toggle}
          className={`
            hidden lg:flex items-center justify-center w-6 h-6 rounded-md
            text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200
            hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors
            ${collapsed ? 'mx-auto' : 'ml-auto'}
          `}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* ── Main Navigation Items ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {!collapsed && (
          <p className="hidden lg:block text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-3 pb-2">
            Main Menu
          </p>
        )}

        {NAV_ITEMS.map((item) => {
          const isActive = normPath === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-150 relative text-sm font-medium
                ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100/80 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-slate-100'
                }
              `}
            >
              {/* Active left marker */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-orange-500 rounded-r-full" />
              )}

              {/* Icon */}
              <div className="relative shrink-0 flex items-center justify-center">
                {item.icon}
                {item.badge && pendingSpoilsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
                )}
              </div>

              {/* Label — desktop expanded */}
              {!collapsed && (
                <span className="hidden lg:block truncate">{item.label}</span>
              )}

              {/* Badge count */}
              {!collapsed && item.badge && pendingSpoilsCount > 0 && (
                <span className="hidden lg:flex ml-auto text-[10px] font-bold bg-rose-500 text-white rounded-full px-1.5 py-0.5 min-w-5 h-5 items-center justify-center">
                  {pendingSpoilsCount > 9 ? '9+' : pendingSpoilsCount}
                </span>
              )}

              {/* Floating Tooltip — collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                  {item.label}
                  {item.badge && pendingSpoilsCount > 0 && (
                    <span className="ml-1 text-rose-300">({pendingSpoilsCount})</span>
                  )}
                </div>
              )}
            </Link>
          )
        })}

        {/* ── Quick Ops Actions (Desktop Expanded) ── */}
        {!collapsed && (
          <div className="hidden lg:block pt-6">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-3 pb-2">
              Operations
            </p>
            <div className="space-y-0.5">
              {RECORD_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onAction(action.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100/80 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${action.dot}`} />
                    <span className="truncate">{action.label}</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded">
                    {action.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── Bottom Section: User & Logout ── */}
      <div className="p-3 border-t border-gray-100 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {!collapsed && (
            <div className="hidden lg:flex flex-col min-w-0">
              <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-slate-500 truncate">
                {user?.email || user?.username || 'Active'}
              </span>
            </div>
          )}
          <button
            onClick={() => logout()}
            title="Log Out"
            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors ml-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
