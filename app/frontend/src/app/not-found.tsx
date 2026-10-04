import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mb-4">
        <span className="text-xl font-bold">404</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Page Not Found</h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-sm">
        The requested inventory page or resource could not be found.
      </p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-orange-500/20"
      >
        Return to Dashboard
      </Link>
    </div>
  )
}
