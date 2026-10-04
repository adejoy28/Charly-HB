'use client'

import { useState, useEffect } from 'react'
import BaseModal from '@/components/ui/BaseModal'
import { useStock } from '@/context/StockContext'
import { recordCorrection } from '@/lib/api'
import { ApiErrorHandler } from '@/lib/errorHandler'
import { formatNumber } from '@/lib/helpers'
import type { Shop } from '@/types'

export default function CorrectionModal() {
  const { activeModal, closeModal, products, shops, refreshProducts } = useStock()
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedShop, setSelectedShop] = useState('')
  const [direction, setDirection] = useState<'add' | 'remove'>('add')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isOpen = activeModal === 'correction'

  const suggestions = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku_code.toLowerCase().includes(search.toLowerCase())
  )

  const selectedProductData = products.find(p => p.id.toString() === selectedProduct)

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct('')
      setSelectedShop('')
      setDirection('add')
      setQuantity('')
      setNote('')
      setSearch('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async () => {
    setError('')

    if (!selectedProduct) { setError('Select a product to adjust'); return }
    if (!quantity || parseInt(quantity) <= 0) { setError('Enter a valid adjustment quantity'); return }
    if (!note.trim()) { setError('A mandatory audit note is required for ledger corrections'); return }

    const signedQty = direction === 'remove' ? -parseInt(quantity) : parseInt(quantity)

    setLoading(true)
    try {
      await recordCorrection({
        product_id:  parseInt(selectedProduct),
        qty:         signedQty,
        note:        note.trim(),
        shop_id:     selectedShop ? parseInt(selectedShop) : null,
        recorded_at: new Date().toISOString(),
      })
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
    <BaseModal isOpen={isOpen} onClose={closeModal} title="Record Inventory Correction">

      {error && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Product search */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Product to Adjust *
        </label>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedProduct(''); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full h-10 min-h-[40px] px-3.5 border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder-[#60646c] focus:outline-none focus:border-[#ff3d00] transition-colors"
            placeholder="Search product..."
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-700 rounded-lg shadow-sm mt-1 max-h-44 overflow-y-auto divide-y divide-neutral-100 dark:divide-slate-800">
              {suggestions.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={() => {
                    setSelectedProduct(p.id.toString())
                    setSearch(p.name)
                    setShowSuggestions(false)
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-neutral-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                  <p className="text-xs text-[#60646c] dark:text-slate-400 font-mono">
                    {p.sku_code} · Current Balance: {formatNumber(p.balance)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Direction: Add vs Remove */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Adjustment Direction *
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDirection('add')}
            className={`h-10 min-h-[40px] px-3 rounded-lg border text-sm font-medium transition-all ${
              direction === 'add'
                ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                : 'border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#60646c] dark:text-slate-400'
            }`}
          >
            + Add Stock (Surplus)
          </button>
          <button
            type="button"
            onClick={() => setDirection('remove')}
            className={`h-10 min-h-[40px] px-3 rounded-lg border text-sm font-medium transition-all ${
              direction === 'remove'
                ? 'border-[#d92d20] bg-rose-50/80 dark:bg-rose-950/40 text-[#d92d20] dark:text-rose-400'
                : 'border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#60646c] dark:text-slate-400'
            }`}
          >
            - Deduct Stock (Shortage)
          </button>
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Correction Quantity *
        </label>
        <input
          type="number"
          step="1"
          min="1"
          inputMode="numeric"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          className="w-full h-10 px-3.5 border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm font-mono font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#ff3d00] transition-colors"
          placeholder="0"
        />
      </div>

      {/* Optional Shop */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Associated Shop / Location (optional)
        </label>
        <select
          value={selectedShop}
          onChange={e => setSelectedShop(e.target.value)}
          className="w-full h-10 min-h-[40px] px-3.5 border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#ff3d00] transition-colors"
        >
          <option value="">Main Warehouse (Default)</option>
          {shops.filter(s => !s.archived).map((s: Shop) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Note (Mandatory for audit trail) */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Audit Justification (Required) *
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder-[#60646c] focus:outline-none focus:border-[#ff3d00] resize-none transition-colors"
          rows={2}
          placeholder="Explain the count variance or recount audit notes..."
          required
        />
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 dark:border-slate-800 pt-4 space-y-2.5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-10 min-h-[40px] bg-[#ff3d00] hover:bg-[#e03600] active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3d00]"
        >
          {loading ? 'Recording Correction...' : 'Apply Ledger Adjustment'}
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
