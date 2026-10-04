// StatCard.tsx — Enterprise summary stat card with semantic accents & Dark/Light mode support
interface StatCardProps {
  label: string
  value: number
  color?: 'gray' | 'green' | 'orange' | 'red'
}

export default function StatCard({ label, value, color = 'gray' }: StatCardProps) {
  const getColorClasses = (c: 'gray' | 'green' | 'orange' | 'red') => {
    const colors = {
      gray: 'text-gray-900 dark:text-white',
      green: 'text-emerald-600 dark:text-emerald-400',
      orange: 'text-[#ff3d00] dark:text-[#ff5722]',
      red: 'text-[#d92d20] dark:text-rose-400'
    }
    return colors[c]
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 transition-colors">
      <div className={`text-2xl sm:text-3xl font-medium font-mono tracking-tight ${getColorClasses(color)}`}>
        {value.toLocaleString()}
      </div>
      <div className="text-xs font-medium text-[#60646c] dark:text-slate-400 mt-1 uppercase tracking-wider">
        {label}
      </div>
    </div>
  )
}
