'use client'

import { useState, useEffect } from 'react'
import BaseModal from '@/components/ui/BaseModal'
import { useStock } from '@/context/StockContext'
import { recordSpoil } from '@/lib/api'
import { ApiErrorHandler } from '@/lib/errorHandler'
import { formatNumber } from '@/lib/helpers'
import type { Product } from '@/types'

const REASONS = [
  { value: 'damaged',  label: 'Damaged Goods',  emoji: '💥' },
  { value: 'expired',  label: 'Expired Date',   emoji: '⏰' },
  { value: 'returned', label: 'Returned Flaw',  emoji: '↩️' },
]

export default function RecordSpoilModal() {
  const { activeModal, closeModal, products, refreshProducts, pendingSpoilsCount, setPendingSpoilsCount } = useStock()
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isOpen = activeModal === 'spoil'

  const suggestions = products.filter(p =>
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku_code.toLowerCase().includes(search.toLowerCase())) &&
    p.balance > 0
  )

  const selectedProductData = products.find(p => p.id.toString() === selectedProduct)

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct('')
      setQuantity('')
      setReason('')
      setNote('')
      setSearch('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async () => {
    setError('')

    if (!selectedProduct) { setError('Select a product to report'); return }
    if (!quantity || parseInt(quantity) <= 0) { setError('Enter a valid quantity'); return }
    if (!reason) { setError('Select a cause of spoil'); return }

    setLoading(true)
    try {
      await recordSpoil({
        product_id:  parseInt(selectedProduct),
        qty:         parseInt(quantity),
        reason,
        note:        note.trim() || null,
        recorded_at: new Date().toISOString(),
      })
      closeModal()
      refreshProducts()
      setPendingSpoilsCount(pendingSpoilsCount + 1)
    } catch (err) {
      const apiError = ApiErrorHandler.handleError(err)
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} title="Record Spoil & Damaged Loss">

      {error && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Product search */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Select Damaged Item *
        </label>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedProduct(''); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full h-10 min-h-[40px] px-3.5 border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder-[#60646c] focus:outline-none focus:border-[#ff3d00] transition-colors"
            placeholder="Search product by name or SKU..."
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
                    {p.sku_code} · On Hand: {formatNumber(p.balance)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Quantity ({selectedProductData ? `max ${formatNumber(selectedProductData.balance)}` : 'units'}) *
        </label>
        <input
          type="number"
          step="1"
          min="1"
          max={selectedProductData?.balance}
          inputMode="numeric"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          className="w-full h-10 px-3.5 border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm font-mono font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#ff3d00] transition-colors"
          placeholder="0"
        />
      </div>

      {/* Reason selector buttons */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-2">
          Damage / Loss Category *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {REASONS.map(r => {
            const isSelected = reason === r.value
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setReason(r.value)}
                className={`py-2.5 px-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  isSelected
                    ? 'border-[#d92d20] bg-rose-50/80 dark:bg-rose-950/40 text-[#d92d20] dark:text-rose-400'
                    : 'border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#60646c] dark:text-slate-300 hover:border-neutral-300 dark:hover:border-slate-600'
                }`}
              >
                <span>{r.emoji}</span>
                <span>{r.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Note */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Incident Details (optional)
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder-[#60646c] focus:outline-none focus:border-[#ff3d00] resize-none transition-colors"
          rows={2}
          placeholder="Details on what happened, carton seal condition, etc..."
        />
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 dark:border-slate-800 pt-4 space-y-2.5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-10 min-h-[40px] bg-[#d92d20] hover:bg-[#b42318] active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d92d20]"
        >
          {loading ? 'Submitting Report...' : 'Submit to Spoils Queue'}
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
