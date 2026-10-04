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
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Shop selector */}
      <div className="mb-5">
        <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Destination Shop / Branch *
        </label>
        <select
          value={selectedShop}
          onChange={e => handleShopChange(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
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
              className="flex-1 rounded-xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
              placeholder="Enter new shop branch name..."
              autoFocus
            />
            <button
              type="button"
              onClick={handleCreateShop}
              className="bg-orange-500 text-white text-xs font-bold px-4 rounded-xl active:scale-95 transition-all"
            >
              Save Shop
            </button>
            <button
              type="button"
              onClick={() => setShowNewShopForm(false)}
              className="border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 text-xs px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Product rows */}
      <div className="mb-4">
        <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Dispatched Products
        </label>

        <div className="space-y-3">
          {rows.map((row, index) => {
            const suggestions = getSuggestions(row)
            const selectedProduct = products.find(p => p.id.toString() === row.productId)
            const lineTotal = (parseInt(row.qty) || 0) * (parseFloat(row.sellingPrice) || 0)

            return (
              <div key={row.id} className="border border-gray-200/80 dark:border-slate-700/80 rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800/60 relative transition-colors">

                {/* Row Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    Item #{index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {lineTotal > 0 && (
                      <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(lineTotal)}
                      </span>
                    )}
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-500 text-xs flex items-center justify-center transition-colors"
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
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Search product by name or SKU..."
                  />

                  {/* Suggestions Dropdown */}
                  {row.showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl mt-1 max-h-44 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
                      {suggestions.map(product => (
                        <button
                          key={product.id}
                          type="button"
                          onMouseDown={() => selectProduct(row.id, product)}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-orange-50/60 dark:hover:bg-orange-950/30 transition-colors"
                        >
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-[11px] text-gray-400 dark:text-slate-400 font-mono">
                            {product.sku_code} · {formatNumber(product.balance)} in stock
                            {product.cost_price > 0 && ` · Cost: ${formatCurrency(product.cost_price)}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  {row.showSuggestions && row.search && suggestions.length === 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl mt-1 px-3.5 py-3 text-xs text-gray-400 dark:text-slate-500">
                      No matching products available in stock
                    </div>
                  )}
                </div>

                {/* Quantity & Price */}
                {row.productId && (
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-slate-700/60">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1">
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
                        className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1">
                        Dispatch Price (₦)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        inputMode="numeric"
                        value={row.sellingPrice}
                        onChange={e => updateRow(row.id, { sellingPrice: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
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
          className="w-full h-10 border-2 border-dashed border-orange-300 dark:border-orange-500/40 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-xl hover:bg-orange-50/50 dark:hover:bg-orange-950/20 active:scale-99 mb-4 flex items-center justify-center gap-1.5 transition-all"
        >
          <span>+ Add Another Product</span>
        </button>
      )}

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-slate-800 pt-4 space-y-2.5">
        {totalCartons > 0 && (
          <div className="flex justify-between items-center py-1">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Total Dispatch Volume</span>
            <div className="text-right">
              <span className="text-base font-bold text-orange-600 dark:text-orange-400 font-mono">{formatNumber(totalCartons)} units</span>
              {totalValue > 0 && (
                <p className="text-xs font-mono font-semibold text-gray-500 dark:text-slate-400">{formatCurrency(totalValue)}</p>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Processing Dispatch...' : 'Confirm Stock Distribution'}
        </button>
        <button
          type="button"
          onClick={closeModal}
          className="w-full h-10 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
      </div>

    </BaseModal>
  )
}
