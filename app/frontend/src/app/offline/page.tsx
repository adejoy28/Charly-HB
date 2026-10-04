// offline/page.tsx — Offline fallback view with dark/light mode consistency
'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center px-6 text-center transition-colors">
      {/* Logo */}
      <div className="w-16 h-16 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25">
        <span className="text-white text-2xl font-black">CHB</span>
      </div>

      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
        Offline Mode Active
      </h1>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
        No active internet connection detected. Saved stock data is cached locally. Reconnect to sync ledger changes.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="h-11 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all"
      >
        Retry Connection
      </button>
    </div>
  )
}
