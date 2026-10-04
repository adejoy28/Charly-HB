// spoils/page.tsx — Enterprise Spoils Queue & Damaged Goods Verification
// Features: Pending Loss Verification Workflow, Reason Codes, Real-Time Balance Re-evaluation & Audit History

'use client'

import { useState, useEffect } from 'react'
import { useStock } from '@/context/StockContext'
import { getMovements, confirmSpoil, rejectSpoil } from '@/lib/api'
import { formatDate, formatTime, formatNumber, extractArray } from '@/lib/helpers'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import { AlertTriangleIcon, CheckCircleIcon } from '@/components/ui/Icons'
import type { Movement } from '@/types'

export default function SpoilsPage() {
  const { refreshProducts, setPendingSpoilsCount, pendingSpoilsCount } = useStock()
  const [pendingSpoils, setPendingSpoils] = useState<Movement[]>([])
  const [historySpoils, setHistorySpoils] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    loadSpoils()
  }, [])

  const loadSpoils = async () => {
    setLoading(true)
    try {
      // Load pending spoils
      const pendingResponse = await getMovements({ type: 'spoil', status: 'pending' })
      setPendingSpoils(extractArray<Movement>(pendingResponse.data))

      // Load confirmed and rejected spoils for history
      const [confirmedResponse, rejectedResponse] = await Promise.all([
        getMovements({ type: 'spoil', status: 'confirmed' }),
        getMovements({ type: 'spoil', status: 'rejected' })
      ])

      const history = [
        ...extractArray<Movement>(confirmedResponse.data),
        ...extractArray<Movement>(rejectedResponse.data)
      ].sort((a: Movement, b: Movement) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())

      setHistorySpoils(history)
    } catch (error) {
      console.error('Failed to load spoils:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (spoilId: number) => {
    setActionLoading(spoilId)
    setActionError(null)
    try {
      await confirmSpoil(spoilId)
      
      const confirmedSpoil = pendingSpoils.find(s => s.id === spoilId)
      if (confirmedSpoil) {
        setPendingSpoils(prev => prev.filter(s => s.id !== spoilId))
        setHistorySpoils(prev => [{ ...confirmedSpoil, status: 'confirmed' }, ...prev])
      }

      await refreshProducts()
      setPendingSpoilsCount(Math.max(0, pendingSpoilsCount - 1))
    } catch (err) {
      setActionError('Failed to confirm spoil loss. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (spoilId: number) => {
    setActionLoading(spoilId)
    setActionError(null)
    try {
      await rejectSpoil(spoilId)
      
      const rejectedSpoil = pendingSpoils.find(s => s.id === spoilId)
      if (rejectedSpoil) {
        setPendingSpoils(prev => prev.filter(s => s.id !== spoilId))
        setHistorySpoils(prev => [{ ...rejectedSpoil, status: 'rejected' }, ...prev])
      }

      setPendingSpoilsCount(Math.max(0, pendingSpoilsCount - 1))
    } catch (err) {
      setActionError('Failed to reject spoil item. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      damaged: 'In-Transit Damage',
      expired: 'Expired Shelf Life',
      returned: 'Defective Return',
      leakage: 'Packaging Leakage'
    }
    return labels[reason] || reason || 'Unspecified'
  }

  const SpoilCard = ({ spoil, showActions = false }: { spoil: Movement; showActions?: boolean }) => {
    const isPending = spoil.status === 'pending'
    const isConfirmed = spoil.status === 'confirmed'
    const isRejected = spoil.status === 'rejected'

    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 transition-all hover:border-gray-300 dark:hover:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center flex-wrap gap-2.5 mb-2.5">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                {spoil.product?.name || 'Unknown Item'}
              </h4>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#f8fafc] dark:bg-slate-800 text-[#60646c] dark:text-slate-400 border border-gray-200 dark:border-slate-700">
                {spoil.product?.sku_code || '—'}
              </span>

              {isPending && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Awaiting Authorization
                </span>
              )}
              {isConfirmed && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  Loss Confirmed
                </span>
              )}
              {isRejected && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#f8fafc] dark:bg-slate-800 text-[#60646c] dark:text-slate-400 border border-gray-200 dark:border-slate-700">
                  Rejected / Voided
                </span>
              )}
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#60646c] dark:text-slate-500 block">
                  Loss Quantity
                </span>
                <span className="font-mono font-medium text-rose-600 dark:text-rose-400 text-sm">
                  -{formatNumber(Math.abs(spoil.qty))} units
                </span>
              </div>

              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#60646c] dark:text-slate-500 block">
                  Incident Reason
                </span>
                <span className="font-medium text-gray-900 dark:text-slate-200">
                  {getReasonLabel(spoil.reason || '')}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#60646c] dark:text-slate-500 block">
                  Logged At
                </span>
                <span className="text-gray-700 dark:text-slate-300">
                  {formatDate(spoil.recorded_at)} <span className="text-[#60646c] dark:text-slate-500 font-mono text-[10px]">{formatTime(spoil.recorded_at)}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#60646c] dark:text-slate-500 block">
                  Internal Notes
                </span>
                <span className="text-[#60646c] dark:text-slate-400 truncate block">
                  {spoil.note || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {showActions && isPending && (
            <div className="flex md:flex-col gap-2 shrink-0 md:w-36 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-slate-800">
              <button
                onClick={() => handleConfirm(spoil.id)}
                disabled={actionLoading === spoil.id}
                className="h-10 flex-1 px-4 bg-[#d92d20] hover:bg-[#b42318] text-white text-xs font-medium rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d92d20]"
              >
                {actionLoading === spoil.id ? 'Processing...' : 'Confirm Loss'}
              </button>
              <button
                onClick={() => handleReject(spoil.id)}
                disabled={actionLoading === spoil.id}
                className="h-10 flex-1 px-4 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-200 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-700 transition-colors disabled:opacity-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                Reject
              </button>
            </div>
          )}

        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* ── Page Header ── */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-gray-900 dark:text-white">
            Spoils & Loss Queue
          </h1>
          {pendingSpoils.length > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium border border-rose-500/20">
              {pendingSpoils.length} Pending
            </span>
          )}
        </div>
        <p className="text-xs text-[#60646c] dark:text-slate-400 mt-1">
          Review damaged and expired warehouse inventory reports before deducting from active balance.
        </p>
      </div>

      {actionError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400">
          {actionError}
        </div>
      )}

      {/* ── Pending Verification Queue ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-[#60646c] dark:text-slate-500 uppercase tracking-wider">
            Pending Verification Queue ({pendingSpoils.length})
          </h3>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-lg h-24 animate-pulse" />
            ))}
          </div>
        ) : pendingSpoils.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6">
            <EmptyState
              icon="✅"
              title="All Clear — Zero Pending Losses"
              description="No spoiled or damaged inventory items currently require supervisor review."
              variant="success"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {pendingSpoils.map((spoil) => (
              <SpoilCard key={spoil.id} spoil={spoil} showActions={true} />
            ))}
          </div>
        )}
      </div>

      {/* ── Spoil History & Audit Log ── */}
      <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
        <h3 className="text-xs font-medium text-[#60646c] dark:text-slate-500 uppercase tracking-wider">
          Resolved Spoils Archive ({historySpoils.length})
        </h3>

        {historySpoils.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6">
            <EmptyState
              icon="📋"
              title="No Prior Spoil Records"
              description="Historical confirmed and rejected spoils will be archived here for audit trail."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {historySpoils.slice(0, 20).map((spoil) => (
              <SpoilCard key={spoil.id} spoil={spoil} showActions={false} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
