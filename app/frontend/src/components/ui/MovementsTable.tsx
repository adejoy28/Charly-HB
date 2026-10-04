// MovementsTable.tsx — Table of movement records with type badge
// Props: movements (array), loading (boolean)

import React from 'react'
import TypeBadge from './TypeBadge'
import type { Product, Shop, Movement } from '@/types'

interface MovementsTableProps {
  movements: Movement[]
  loading: boolean
}

export default function MovementsTable({ movements, loading }: MovementsTableProps) {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl overflow-hidden animate-pulse">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200/80 dark:border-slate-800">
          <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/4"></div>
        </div>
        <div className="p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 dark:bg-slate-800/60 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!movements || movements.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200/80 dark:border-slate-800">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Movements</h3>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl text-gray-400">📋</span>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No movements recorded yet</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">Start by recording opening stock or receiving goods</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
      <div className="px-4 lg:px-6 py-4 border-b border-gray-200/80 dark:border-slate-800">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Movements</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/80 dark:divide-slate-800">
          <thead className="bg-slate-50/80 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Shop / Note
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800/60">
            {movements.map((movement) => (
              <tr key={movement.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                  <div className="text-xs font-mono text-gray-700 dark:text-slate-300">
                    {formatDate(movement.recorded_at)}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                  <div className="text-xs font-mono text-gray-500 dark:text-slate-400">
                    {formatTime(movement.recorded_at)}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">
                      {movement.product?.name || 'Unknown'}
                    </div>
                    <div className="text-[11px] font-mono text-gray-400 dark:text-slate-500">
                      {movement.product?.sku_code || ''}
                    </div>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                  <TypeBadge type={movement.type} />
                </td>
                <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                  <div className={`text-xs font-bold font-mono ${
                    movement.qty > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                  }`}>
                    {movement.qty > 0 ? '+' : ''}{formatNumber(movement.qty)}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                  <div className="text-xs text-gray-700 dark:text-slate-300 font-medium">
                    {movement.shop?.name || movement.note || '—'}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                  {movement.status && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      movement.status === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                      movement.status === 'rejected' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                      movement.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {movement.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
