'use client'

import { useState, useEffect, useRef } from 'react'
import BaseModal from '@/components/ui/BaseModal'
import { useStock } from '@/context/StockContext'
import { recordDistribution, createShop } from '@/lib/api'
import { ApiErrorHandler } from '@/lib/errorHandler'
import { formatCurrency, formatNumber } from '@/lib/helpers'
import type { Product } from '@/types'

interface DistributionRow {
  id: string
  productId: string
  qty: string
  sellingPrice: string
  search: string
  showSuggestions: boolean
}

function newRow(): DistributionRow {
  return {
    id: Math.random().toString(36).slice(2),
    productId: '',
    qty: '',
    sellingPrice: '',
    search: '',
    showSuggestions: false,
  }
}

export default function DistributeModal() {
  const { activeModal, closeModal, products, shops, refreshProducts, refreshShops } = useStock()
  const [selectedShop, setSelectedShop] = useState('')
  const [rows, setRows] = useState<DistributionRow[]>([newRow()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showNewShopForm, setShowNewShopForm] = useState(false)
  const [newShopName, setNewShopName] = useState('')
  const searchRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const isOpen = activeModal === 'distribution'
  const availableProducts = products.filter(p => p.balance > 0)

  // IDs of products already added in any row
  const usedProductIds = rows.map(r => r.productId).filter(Boolean)

  useEffect(() => {
    if (isOpen) {
      setSelectedShop('')
      setRows([newRow()])
      setError('')
      setShowNewShopForm(false)
      setNewShopName('')
    }
  }, [isOpen])

  // Suggestions for a given row — exclude already-used products
  const getSuggestions = (row: DistributionRow): Product[] => {
    const term = row.search.toLowerCase()
    return availableProducts.filter(p => {
      if (usedProductIds.includes(p.id.toString()) && p.id.toString() !== row.productId) return false
      if (!term) return true
      return p.name.toLowerCase().includes(term) || p.sku_code.toLowerCase().includes(term)
    })
  }

  const updateRow = (id: string, patch: Partial<DistributionRow>) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
  }

  const selectProduct = (rowId: string, product: Product) => {
    updateRow(rowId, {
      productId: product.id.toString(),
      search: product.name,
      sellingPrice: product.cost_price > 0 ? product.cost_price.toString() : '',
      showSuggestions: false,
    })
    setTimeout(() => {
      const el = document.getElementById(`qty-${rowId}`)
      if (el) el.focus()
    }, 50)
  }

  const removeRow = (id: string) => {
    setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev)
  }

  const addRow = () => {
    setRows(prev => [...prev, newRow()])
  }

  // Totals
  const totalCartons = rows.reduce((sum, r) => sum + (parseInt(r.qty) || 0), 0)
  const totalValue = rows.reduce((sum, r) => {
    const qty = parseInt(r.qty) || 0
    const price = parseFloat(r.sellingPrice) || 0
    return sum + qty * price
  }, 0)

  const handleShopChange = (shopId: string) => {
    if (shopId === 'new') {
      setShowNewShopForm(true)
    } else {
      setSelectedShop(shopId)
      setShowNewShopForm(false)
    }
  }

  const handleCreateShop = async () => {
    if (!newShopName.trim()) return
    try {
      const response = await createShop({ name: newShopName.trim() })
      const newShop = response.data
      await refreshShops()
      setSelectedShop(newShop.id.toString())
      setShowNewShopForm(false)
      setNewShopName('')
    } catch (err) {
      const apiError = ApiErrorHandler.handleError(err)
      setError(apiError.message)
    }
  }

  const handleSubmit = async () => {
    setError('')

    if (!selectedShop) {
      setError('Please select a destination shop')
      return
    }

    const validRows = rows.filter(r => r.productId && parseInt(r.qty) > 0)
    if (validRows.length === 0) {
      setError('Add at least one product with a quantity')
      return
    }

    const incompleteRow = rows.find(r => r.productId && !parseInt(r.qty))
    if (incompleteRow) {
      setError('Enter a quantity for all added products')
      return
    }

    setLoading(true)
    try {
      const productsPayload = validRows.map(r => {
        const product = products.find(p => p.id.toString() === r.productId)
        const sellingPrice = r.sellingPrice !== ''
          ? parseFloat(r.sellingPrice)
          : (product?.cost_price ?? null)
        return {
          product_id:    parseInt(r.productId),
          qty:           parseInt(r.qty),
          selling_price: sellingPrice,
        }
      })

      await recordDistribution({
        shop_id:  parseInt(selectedShop),
        products: productsPayload,
        note:     '',
      })

      closeModal()
      refreshProducts()
      refreshShops()
    } catch (err) {
      const apiError = ApiErrorHandler.handleError(err)
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} title="Distribute Stock to Shop" size="wide">

      {error && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Shop selector */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Destination Shop / Branch *
        </label>
        <select
          value={selectedShop}
          onChange={e => handleShopChange(e.target.value)}
          className="w-full h-10 min-h-[40px] px-3.5 border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00] transition-colors"
        >
          <option value="">Choose a branch or shop...</option>
          {shops.filter(s => !s.archived).map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
          <option value="new">+ Register New Destination Shop</option>
        </select>

        {/* Inline new shop form */}
        {showNewShopForm && (
          <div className="mt-2.5 flex gap-2 animate-in fade-in">
            <input
              type="text"
              value={newShopName}
              onChange={e => setNewShopName(e.target.value)}
              className="flex-1 h-10 min-h-[40px] rounded-lg border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#ff3d00]"
              placeholder="Enter new shop branch name..."
              autoFocus
            />
            <button
              type="button"
              onClick={handleCreateShop}
              className="h-10 min-h-[40px] bg-[#ff3d00] hover:bg-[#e03600] text-white text-xs font-medium px-4 rounded-lg active:scale-[0.98] transition-all"
            >
              Save Shop
            </button>
            <button
              type="button"
              onClick={() => setShowNewShopForm(false)}
              className="h-10 min-h-[40px] border border-neutral-300 dark:border-slate-700 text-[#60646c] dark:text-slate-400 text-xs px-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-800"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Product rows */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-2">
          Dispatched Products
        </label>

        <div className="space-y-3">
          {rows.map((row, index) => {
            const suggestions = getSuggestions(row)
            const selectedProduct = products.find(p => p.id.toString() === row.productId)
            const lineTotal = (parseInt(row.qty) || 0) * (parseFloat(row.sellingPrice) || 0)

            return (
              <div key={row.id} className="border border-neutral-200 dark:border-slate-700 rounded-lg p-3.5 bg-neutral-50 dark:bg-slate-800/60 relative transition-colors">

                {/* Row Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider">
                    Item #{index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {lineTotal > 0 && (
                      <span className="text-xs font-mono font-medium text-[#ff3d00]">
                        {formatCurrency(lineTotal)}
                      </span>
                    )}
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-slate-700 text-neutral-600 dark:text-slate-400 hover:text-[#d92d20] text-xs flex items-center justify-center transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Product Search Input */}
                <div className="relative mb-2">
                  <input
                    ref={el => { searchRefs.current[row.id] = el }}
                    type="text"
                    value={row.search}
                    onChange={e => updateRow(row.id, {
                      search: e.target.value,
                      productId: '',
                      sellingPrice: '',
                      showSuggestions: true,
                    })}
                    onFocus={() => updateRow(row.id, { showSuggestions: true })}
                    onBlur={() => setTimeout(() => updateRow(row.id, { showSuggestions: false }), 200)}
                    className="w-full h-10 min-h-[40px] px-3.5 border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-gray-900 dark:text-white placeholder-[#60646c] focus:outline-none focus:border-[#ff3d00] transition-colors"
                    placeholder="Search product by name or SKU..."
                  />

                  {/* Suggestions Dropdown */}
                  {row.showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-700 rounded-lg shadow-sm mt-1 max-h-44 overflow-y-auto divide-y divide-neutral-100 dark:divide-slate-800">
                      {suggestions.map(product => (
                        <button
                          key={product.id}
                          type="button"
                          onMouseDown={() => selectProduct(row.id, product)}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-neutral-50 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-xs text-[#60646c] dark:text-slate-400 font-mono">
                            {product.sku_code} · {formatNumber(product.balance)} in stock
                            {product.cost_price > 0 && ` · Cost: ${formatCurrency(product.cost_price)}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  {row.showSuggestions && row.search && suggestions.length === 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-700 rounded-lg shadow-sm mt-1 px-3.5 py-3 text-xs text-[#60646c] dark:text-slate-400">
                      No matching products available in stock
                    </div>
                  )}
                </div>

                {/* Quantity & Price */}
                {row.productId && (
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-neutral-200/80 dark:border-slate-700/60">
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-[#60646c] dark:text-slate-400 mb-1">
                        Quantity ({selectedProduct ? `max ${formatNumber(selectedProduct.balance)}` : 'units'})
                      </label>
                      <input
                        id={`qty-${row.id}`}
                        type="number"
                        step="1"
                        min="1"
                        max={selectedProduct?.balance}
                        inputMode="numeric"
                        value={row.qty}
                        onChange={e => updateRow(row.id, { qty: e.target.value })}
                        className="w-full h-10 px-3 border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm font-mono font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#ff3d00]"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-[#60646c] dark:text-slate-400 mb-1">
                        Dispatch Price (₦)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        inputMode="numeric"
                        value={row.sellingPrice}
                        onChange={e => updateRow(row.id, { sellingPrice: e.target.value })}
                        className="w-full h-10 px-3 border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm font-mono font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#ff3d00]"
                        placeholder={selectedProduct?.cost_price?.toString() || '0'}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Product Button */}
      {availableProducts.length > usedProductIds.length && (
        <button
          type="button"
          onClick={addRow}
          className="w-full h-10 min-h-[40px] border border-neutral-300 dark:border-slate-700 hover:border-neutral-400 text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-neutral-50 dark:hover:bg-slate-800 active:scale-[0.98] mb-4 flex items-center justify-center gap-1.5 transition-all"
        >
          <span>+ Add Another Product</span>
        </button>
      )}

      {/* Footer */}
      <div className="border-t border-neutral-200 dark:border-slate-800 pt-4 space-y-2.5">
        {totalCartons > 0 && (
          <div className="flex justify-between items-center py-1">
            <span className="text-xs font-medium text-[#60646c] dark:text-slate-400">Total Dispatch Volume</span>
            <div className="text-right">
              <span className="text-base font-medium text-[#ff3d00] font-mono">{formatNumber(totalCartons)} units</span>
              {totalValue > 0 && (
                <p className="text-xs font-mono font-medium text-[#60646c] dark:text-slate-400">{formatCurrency(totalValue)}</p>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-10 min-h-[40px] bg-[#ff3d00] hover:bg-[#e03600] active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3d00]"
        >
          {loading ? 'Processing Dispatch...' : 'Confirm Stock Distribution'}
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
