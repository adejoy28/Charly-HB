// TopBar.tsx — Enterprise glassmorphic header with live indicator, search, period filter & theme toggle
'use client'

import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useStock } from '@/context/StockContext'
import { SunIcon, MoonIcon, SearchIcon, RefreshCwIcon } from '@/components/ui/Icons'

interface TopBarProps {
  title: string
  period: string
  onPeriodChange: (period: string) => void
}

export default function TopBar({ title, period, onPeriodChange }: TopBarProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const { refreshAllData, loading } = useStock()

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: '7D' },
    { value: 'month', label: '30D' },
    { value: 'all', label: 'All Time' },
  ]

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-gray-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Page Title & System Status */}
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-medium tracking-tight text-gray-900 dark:text-white truncate">
                  {title}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="hidden md:block text-xs text-[#60646c] dark:text-slate-400">
                Multi-Tenant Inventory & Real-Time Stock Ledger
              </p>
            </div>
          </div>

          {/* Right: Actions, Filters, Theme Switcher & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Period Selector Tabs */}
            <div className="flex items-center p-0.5 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              {periods.map((p) => {
                const isActive = period === p.value
                return (
                  <button
                    key={p.value}
                    onClick={() => onPeriodChange(p.value)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs font-medium'
                        : 'text-[#60646c] dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>

            {/* Quick Refresh */}
            <button
              onClick={() => refreshAllData()}
              title="Refresh Live Data"
              disabled={loading}
              className="p-2 text-[#60646c] dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
            >
              <RefreshCwIcon size={16} className={loading ? 'animate-spin text-[#ff3d00]' : ''} />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 text-[#60646c] dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-gray-200 dark:border-slate-700"
            >
              {resolvedTheme === 'dark' ? (
                <SunIcon size={17} className="text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <MoonIcon size={17} className="text-slate-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* User Profile Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-[#ff3d00] flex items-center justify-center text-white font-medium text-xs">
                {userInitial}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-medium text-gray-900 dark:text-white leading-tight">
                  {user?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-[#60646c] dark:text-slate-400 leading-tight">
                  @{user?.username || 'tenant'}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  )
}
