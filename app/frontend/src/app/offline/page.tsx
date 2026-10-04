// offline/page.tsx — Offline fallback view with dark/light mode consistency
'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center px-6 text-center transition-colors">
      {/* Logo */}
      <div className="w-16 h-16 bg-[#ff3d00] rounded-lg flex items-center justify-center mb-6 shadow-sm">
        <span className="text-white text-2xl font-medium tracking-tight">CHB</span>
      </div>

      <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-gray-900 dark:text-white mb-2">
        Offline Mode Active
      </h1>
      <p className="text-xs sm:text-sm text-[#60646c] dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
        No active internet connection detected. Saved stock data is cached locally. Reconnect to sync ledger changes.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="h-10 min-h-[40px] px-6 bg-[#ff3d00] hover:bg-[#e03600] active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3d00] focus-visible:ring-offset-2"
      >
        Retry Connection
      </button>
    </div>
  )
}
