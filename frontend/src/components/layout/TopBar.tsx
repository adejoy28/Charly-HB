// TopBar — Sticky header showing app name, page title, and period toggle
'use client'

interface TopBarProps {
  title: string
  period: string
  onPeriodChange: (period: string) => void
}

export default function TopBar({ title, period, onPeriodChange }: TopBarProps) {
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'all', label: 'All' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      {/* App name bar */}
      <div className="flex items-center justify-between px-4 lg:px-8 pt-3 pb-1">
        <div className="flex items-center gap-2">
          {/* Logo mark — orange circle with CHB */}
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-bold tracking-tight">CHB</span>
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">Charly HB</span>
        </div>
        <span className="text-xs text-gray-400">{today}</span>
      </div>

      {/* Page title + period toggle */}
      <div className="flex items-center justify-between px-4 lg:px-8 pb-2.5 pt-1">
        <h1 className="text-sm lg:text-base font-semibold text-gray-900 truncate">{title}</h1>

        {/* Period toggle — scrollable on small screens */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide shrink-0 ml-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              className={`text-xs font-medium rounded-full px-3 py-1 whitespace-nowrap shrink-0 active:opacity-70 ${
                period === p.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
