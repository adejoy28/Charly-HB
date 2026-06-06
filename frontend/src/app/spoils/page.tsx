// spoils/page.tsx — Review and action pending spoils
// Shows pending spoil queue with confirm/reject actions and spoil history

'use client'

import { useState, useEffect } from 'react'
import { useStock } from '@/context/StockContext'
import { getMovements, confirmSpoil, rejectSpoil } from '@/lib/api'
import { formatDate, formatTime, formatNumber, extractArray } from '@/lib/helpers'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import type { Product, Movement } from '@/types'

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
    try {
      await confirmSpoil(spoilId)
      
      // Move from pending to history
      const confirmedSpoil = pendingSpoils.find(s => s.id === spoilId)
      if (confirmedSpoil) {
        setPendingSpoils(prev => prev.filter(s => s.id !== spoilId))
        setHistorySpoils(prev => [{ ...confirmedSpoil, status: 'confirmed' }, ...prev])
      }

      await refreshProducts()
      setPendingSpoilsCount(pendingSpoilsCount - 1)
    } catch (error) {
      setActionError('Failed to confirm spoil. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (spoilId: number) => {
    setActionLoading(spoilId)
    try {
      await rejectSpoil(spoilId)
      
      // Move from pending to history
      const rejectedSpoil = pendingSpoils.find(s => s.id === spoilId)
      if (rejectedSpoil) {
        setPendingSpoils(prev => prev.filter(s => s.id !== spoilId))
        setHistorySpoils(prev => [{ ...rejectedSpoil, status: 'rejected' }, ...prev])
      }

      setPendingSpoilsCount(pendingSpoilsCount - 1)
    } catch (error) {
      setActionError('Failed to reject spoil. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const getReasonLabel = (reason: string) => {
    const labels = {
      damaged: 'Damaged',
      expired: 'Expired',
      returned: 'Returned'
    }
    return labels[reason as keyof typeof labels] || reason
  }

  const SpoilRow = ({ spoil, showActions = false }: { spoil: Movement; showActions?: boolean }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-3">
            <h4 className="font-medium text-gray-900 text-sm">
              {spoil.product?.name || 'Unknown Product'}
            </h4>
            <span className="text-xs text-gray-400">
              {spoil.product?.sku_code || ''}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              spoil.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
              spoil.status === 'confirmed' ? 'bg-red-50 text-red-500' :
              spoil.status === 'rejected' ? 'bg-gray-100 text-gray-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {spoil.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400">Quantity</p>
              <p className="font-medium text-red-500">{formatNumber(Math.abs(spoil.qty))} units</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Reason</p>
              <p className="font-medium text-gray-700">{getReasonLabel(spoil.reason || '')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Date</p>
              <p className="text-gray-700">{formatDate(spoil.recorded_at)}</p>
              <p className="text-xs text-gray-400">{formatTime(spoil.recorded_at)}</p>
            </div>
            {spoil.note ? (
              <div>
                <p className="text-xs text-gray-400">Note</p>
                <p className="text-gray-700 truncate">{spoil.note}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-400">Note</p>
                <p className="text-gray-400">—</p>
              </div>
            )}
          </div>
        </div>

        {showActions && spoil.status === 'pending' && (
          <div className="flex md:flex-col gap-2 shrink-0 md:w-40">
            <button
              onClick={() => handleConfirm(spoil.id)}
              disabled={actionLoading === spoil.id}
              className="flex-1 md:flex-none h-10 md:h-12 px-3 bg-orange-500 text-white text-sm font-semibold rounded-xl active:opacity-70 disabled:opacity-40"
            >
              {actionLoading === spoil.id ? '...' : 'Confirm'}
            </button>
            <button
              onClick={() => handleReject(spoil.id)}
              disabled={actionLoading === spoil.id}
              className="flex-1 md:flex-none h-10 md:h-12 px-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl active:opacity-70 disabled:opacity-40"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Spoils Queue</h1>
        <p className="text-sm text-gray-500 mt-1">Review and action pending spoiled items</p>
      </div>

      {/* Pending Spoils Queue */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Pending Spoils ({pendingSpoils.length})
        </h3>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse"></div>
            ))}
          </div>
        ) : pendingSpoils.length === 0 ? (
          <EmptyState
            icon="✅"
            title="No pending spoils"
            description="All spoils have been reviewed. You're all clear!"
            variant="success"
          />
        ) : (
          <div className="space-y-3">
            {pendingSpoils.map((spoil) => (
              <SpoilRow key={spoil.id} spoil={spoil} showActions={true} />
            ))}
          </div>
        )}
      </div>

      {/* History Section */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          History ({historySpoils.length})
        </h3>

        {historySpoils.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No history yet"
            description="Confirmed and rejected spoils will appear here"
          />
        ) : (
          <div className="space-y-3">
            {historySpoils.map((spoil) => (
              <SpoilRow key={spoil.id} spoil={spoil} showActions={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
