// EmptyState.tsx — Consistent empty state component with icon, title, description, and optional CTA
// Props: title (string), description (string), action? (object with label and onClick), variant? ('default' | 'success')

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'success'
}

export default function EmptyState({ 
  icon = '📋', 
  title, 
  description, 
  action, 
  variant = 'default' 
}: EmptyStateProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-8 text-center transition-colors">
      <div className={`w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center ${
        variant === 'success' 
          ? 'bg-emerald-500/10 text-emerald-500' 
          : 'bg-[#f8fafc] dark:bg-slate-800 text-[#60646c] dark:text-slate-400 border border-gray-200 dark:border-slate-700'
      }`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-xs text-[#60646c] dark:text-slate-400 mb-5 max-w-sm mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="h-10 px-5 bg-[#ff3d00] hover:bg-[#e03600] text-white text-xs font-medium rounded-lg active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3d00]"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
