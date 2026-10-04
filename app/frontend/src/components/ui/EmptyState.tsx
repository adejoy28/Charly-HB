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
    <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-8 text-center transition-colors">
      <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
        variant === 'success' 
          ? 'bg-emerald-500/10 text-emerald-500' 
          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
      }`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl h-11 px-5 active:opacity-90 transition-all shadow-xs"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
