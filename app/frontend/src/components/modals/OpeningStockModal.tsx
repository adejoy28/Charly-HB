'use client'

import { useState, useEffect } from 'react'
import BaseModal from '@/components/ui/BaseModal'
import { useStock } from '@/context/StockContext'
import { recordOpening } from '@/lib/api'
import { ApiErrorHandler } from '@/lib/errorHandler'
import { formatNumber } from '@/lib/helpers'
import type { Product } from '@/types'

export default function OpeningStockModal() {
  const { activeModal, closeModal, products, refreshProducts } = useStock()
  const [openingData, setOpeningData] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [alreadyRecorded, setAlreadyRecorded] = useState(false)

  const isOpen = activeModal === 'opening'

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku_code.toLowerCase().includes(search.toLowerCase())
  )

  const totalCartons = Object.values(openingData).reduce(
    (sum, v) => sum + (parseInt(v) || 0), 0
  )

  useEffect(() => {
    if (isOpen && products.length > 0) {
      // Pre-fill with current balance
      const data: Record<string, string> = {}
      products.forEach(p => { data[p.id.toString()] = p.balance > 0 ? p.balance.toString() : '' })
      setOpeningData(data)
      setSearch('')
      setError('')

      // Check if opening already recorded today
      const today = new Date().toISOString().split('T')[0]
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/movements?type=opening&from=${today}&to=${today}`)
        .then(r => r.json())
        .then(d => {
          const items = d.data || d
          setAlreadyRecorded(Array.isArray(items) && items.length > 0)
        })
        .catch(() => {})
    }
  }, [isOpen, products])

  const handleSubmit = async () => {
    setError('')

    const movements = Object.entries(openingData)
      .filter(([_, v]) => parseInt(v) > 0)
      .map(([productId, qty]) => ({
        product_id:  parseInt(productId),
        qty:         parseInt(qty),
        recorded_at: new Date().toISOString(),
      }))

    if (movements.length === 0) {
      setError('Enter a quantity for at least one product')
      return
    }

    setLoading(true)
    try {
      await recordOpening({ products: movements })
      closeModal()
      refreshProducts()
    } catch (err) {
      const apiError = ApiErrorHandler.handleError(err)
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} title="Set Opening Stock">

      {/* Already recorded warning */}
      {alreadyRecorded && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-400 mb-0.5">Already Recorded Today</p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Opening stock was already initialized today. Recording again will append another ledger entry.
            Use Inventory Correction instead if you need to adjust discrepancies.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 min-h-[40px] px-3.5 border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder-[#60646c] focus:outline-none focus:border-[#ff3d00] transition-colors"
          placeholder="Filter catalog products..."
        />
      </div>

      {/* Product list */}
      <div className="space-y-2 max-h-72 overflow-y-auto mb-4 pr-1">
        {filteredProducts.map(product => (
          <div key={product.id} className="flex items-center gap-3 bg-neutral-50 dark:bg-slate-800/60 border border-neutral-200 dark:border-slate-700 rounded-lg px-3.5 py-2.5 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
              <p className="text-xs text-[#60646c] dark:text-slate-400">
                <span className="font-mono">{product.sku_code}</span> · On Hand: <strong className="text-gray-900 dark:text-slate-200">{formatNumber(product.balance)}</strong>
              </p>
            </div>
            <input
              type="number"
              step="1"
              min="0"
              inputMode="numeric"
              value={openingData[product.id.toString()] || ''}
              onChange={e => setOpeningData(prev => ({ ...prev, [product.id.toString()]: e.target.value }))}
              className="w-20 h-10 px-2 border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm font-mono font-medium text-center text-gray-900 dark:text-white focus:outline-none focus:border-[#ff3d00]"
              placeholder="0"
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 dark:border-slate-800 pt-4 space-y-2.5">
        {totalCartons > 0 && (
          <div className="flex justify-between items-center py-1">
            <span className="text-xs font-medium text-[#60646c] dark:text-slate-400">Total Opening Quantity</span>
            <span className="text-base font-medium text-gray-900 dark:text-white font-mono">{formatNumber(totalCartons)} units</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-10 min-h-[40px] bg-[#ff3d00] hover:bg-[#e03600] active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3d00]"
        >
          {loading ? 'Recording Ledger...' : 'Commit Opening Stock'}
        </button>
        <button
          type="button"
          onClick={closeModal}
          className="w-full h-10 min-h-[40px] border border-neutral-300 dark:border-slate-700 text-gray-900 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
        >
          Cancel
        </button>
      </div>
    </BaseModal>
  )
}
