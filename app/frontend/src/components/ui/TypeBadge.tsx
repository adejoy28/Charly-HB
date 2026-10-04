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
        dot: 'bg-[#ff3d00]',
        classes: 'bg-[#ff3d00]/10 text-[#ff3d00] border border-[#ff3d00]/20'
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
      classes: 'bg-[#f8fafc] dark:bg-slate-800 text-[#60646c] dark:text-slate-300 border border-gray-200 dark:border-slate-700' 
    }
  }

  const config = getBadgeConfig(type)

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${config.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
