import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 bg-[#ff3d00]/10 text-[#ff3d00] rounded-lg flex items-center justify-center mb-4">
        <span className="text-xl font-medium">404</span>
      </div>
      <h2 className="text-xl font-medium tracking-tight text-gray-900 dark:text-white">Page Not Found</h2>
      <p className="text-sm text-[#60646c] dark:text-slate-400 mt-1 max-w-sm">
        The requested inventory page or resource could not be found.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center h-10 min-h-[40px] px-4 bg-[#ff3d00] hover:bg-[#e03600] active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3d00] focus-visible:ring-offset-2"
      >
        Return to Dashboard
      </Link>
    </div>
  )
}
