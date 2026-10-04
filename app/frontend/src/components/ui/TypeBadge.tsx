// TypeBadge.tsx — Enterprise pill badge for movement type with semantic accents and dark mode
interface TypeBadgeProps {
  type: 'opening' | 'receipt' | 'distribution' | 'correction' | 'spoil'
}

export default function TypeBadge({ type }: TypeBadgeProps) {
  const getBadgeConfig = (t: TypeBadgeProps['type']) => {
    const configs = {
      opening: {
        label: 'Opening',
        dot: 'bg-blue-500',
        classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
      },
      receipt: {
        label: 'Inbound Receipt',
        dot: 'bg-emerald-500',
        classes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
      },
      distribution: {
        label: 'Distributed',
        dot: 'bg-orange-500',
        classes: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
      },
      correction: {
        label: 'Correction',
        dot: 'bg-purple-500',
        classes: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
      },
      spoil: {
        label: 'Spoil / Loss',
        dot: 'bg-rose-500',
        classes: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
      }
    }
    return configs[t] || { 
      label: t, 
      dot: 'bg-slate-400',
      classes: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700' 
    }
  }

  const config = getBadgeConfig(type)

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${config.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
