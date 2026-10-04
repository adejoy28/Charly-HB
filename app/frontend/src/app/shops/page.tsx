// shops/page.tsx — Enterprise Delivery Destinations & Branch Distribution Ledger
// Features: Active Branch Management, Delivery Value Aggregation, Branch History & Archive Control

'use client'

import { useState, useEffect } from 'react'
import { useStock } from '@/context/StockContext'
import { createShop, archiveShop, getMovements } from '@/lib/api'
import { formatDate, formatTime, formatNumber, formatCurrency, extractArray } from '@/lib/helpers'
import { ApiErrorHandler } from '@/lib/errorHandler'
import { PlusIcon } from '@/components/ui/Icons'
import type { Shop, Movement } from '@/types'

interface ShopMovements {
  [key: number]: Movement[]
}

export default function ShopsPage() {
  const { shops, refreshShops } = useStock()
  const [showArchived, setShowArchived] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newShopName, setNewShopName] = useState('')
  const [loading, setLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [confirmArchive, setConfirmArchive] = useState<number | null>(null)
  const [archiveError, setArchiveError] = useState<string | null>(null)
  const [expandedShop, setExpandedShop] = useState<number | null>(null)
  const [shopMovements, setShopMovements] = useState<ShopMovements>({})

  useEffect(() => {
    refreshShops(showArchived)
  }, [showArchived])

  const filteredShops = Array.isArray(shops) ? shops.filter((shop: Shop) => 
    showArchived ? true : !shop.archived
  ) : []

  const handleAddShop = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newShopName.trim()) return

    setCreateError(null)
    setLoading(true)
    try {
      await createShop({ name: newShopName.trim() })
      await refreshShops(showArchived)
      setNewShopName('')
      setShowAddForm(false)
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      setCreateError(apiError.message || 'Failed to create shop branch.')
    } finally {
      setLoading(false)
    }
  }

  const handleArchiveShop = async (shop: Shop) => {
    setArchiveError(null)
    try {
      await archiveShop(shop.id)
      await refreshShops(showArchived)
      setConfirmArchive(null)
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      setArchiveError(apiError.message || 'Failed to archive shop branch.')
    }
  }

  const loadShopMovements = async (shopId: number) => {
    if (shopMovements[shopId]) {
      setExpandedShop(expandedShop === shopId ? null : shopId)
      return
    }

    try {
      const response = await getMovements({ shop_id: shopId })
      setShopMovements(prev => ({
        ...prev,
        [shopId]: extractArray<Movement>(response.data)
      }))
      setExpandedShop(shopId)
    } catch (error) {
      console.error('Failed to load shop movements:', error)
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-gray-900 dark:text-white">
              Shops & Delivery Destinations
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#f8fafc] dark:bg-slate-800 text-[#60646c] dark:text-slate-300 font-medium border border-gray-200 dark:border-slate-700 font-mono">
              {filteredShops.length} branches
            </span>
          </div>
          <p className="text-xs text-[#60646c] dark:text-slate-400 mt-1">
            Track outbound stock deliveries, retail branches, and fulfillment history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="h-10 inline-flex items-center gap-2 text-xs font-medium text-gray-900 dark:text-slate-300 cursor-pointer select-none px-3.5 bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-lg">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={e => setShowArchived(e.target.checked)}
              className="rounded text-[#ff3d00] focus:ring-0 w-3.5 h-3.5"
            />
            <span>Show Archived</span>
          </label>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-10 inline-flex items-center gap-1.5 px-4 bg-[#ff3d00] hover:bg-[#e03600] text-white text-xs font-medium rounded-lg transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3d00]"
          >
            <PlusIcon size={15} />
            <span>{showAddForm ? 'Close Form' : 'New Destination'}</span>
          </button>
        </div>
      </div>

      {/* ── Add Shop Drawer ── */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-5 sm:p-6 transition-all animate-in fade-in">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-xs font-medium text-gray-900 dark:text-white uppercase tracking-wider">
              Register Delivery Destination
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#60646c] hover:text-gray-900 dark:hover:text-slate-300 font-medium"
            >
              Cancel
            </button>
          </div>

          {createError && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400">
              {createError}
            </div>
          )}

          <form onSubmit={handleAddShop} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newShopName}
              onChange={e => setNewShopName(e.target.value)}
              placeholder="e.g. Ikeja Branch / Main Street Store"
              className="flex-1 h-10 px-4 border border-gray-200 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800 rounded-lg text-xs text-gray-900 dark:text-white placeholder-[#60646c] focus:outline-none focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00] transition-colors"
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-6 bg-[#ff3d00] hover:bg-[#e03600] text-white text-xs font-medium rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3d00]"
            >
              {loading ? 'Creating...' : 'Save Destination'}
            </button>
          </form>
        </div>
      )}

      {/* ── Shops Grid ── */}
      {filteredShops.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-10 text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-slate-300">No destination shops found</p>
          <p className="text-xs text-[#60646c] dark:text-slate-500 mt-1">Register your first retail shop or delivery location above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShops.map((shop) => {
            const isExpanded = expandedShop === shop.id
            const movements = shopMovements[shop.id] || []

            return (
              <div 
                key={shop.id}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-5 hover:border-gray-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Shop Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                          {shop.name}
                        </h3>
                        {shop.archived && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#f8fafc] dark:bg-slate-800 text-[#60646c] border border-gray-200 dark:border-slate-700">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#60646c] dark:text-slate-500 mt-0.5">
                        Branch #{shop.id}
                      </p>
                    </div>

                    {!shop.archived && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {confirmArchive === shop.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 p-1 rounded-lg border border-rose-200 dark:border-rose-900">
                            <button
                              onClick={() => handleArchiveShop(shop)}
                              className="px-2 py-0.5 text-[10px] font-medium bg-rose-600 text-white rounded"
                            >
                              Archive
                            </button>
                            <button
                              onClick={() => setConfirmArchive(null)}
                              className="px-2 py-0.5 text-[10px] font-medium text-[#60646c]"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmArchive(shop.id)}
                            className="text-xs text-rose-500 hover:text-rose-600 p-1 rounded transition-colors font-medium"
                            title="Archive shop"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metrics 3-Col Bar */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#f8fafc] dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/60 rounded-lg mb-4">
                    <div>
                      <span className="text-[10px] font-medium text-[#60646c] dark:text-slate-500 uppercase tracking-wider block">
                        Total Volume
                      </span>
                      <span className="text-lg font-medium text-gray-900 dark:text-white font-mono">
                        {formatNumber(shop.total_distributed)} <span className="text-xs font-normal text-[#60646c]">units</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-medium text-[#60646c] dark:text-slate-500 uppercase tracking-wider block">
                        Total Value
                      </span>
                      <span className="text-lg font-medium text-[#ff3d00] font-mono">
                        {shop.total_value > 0 ? formatCurrency(shop.total_value) : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer History Toggle */}
                <div>
                  <button
                    onClick={() => loadShopMovements(shop.id)}
                    className="w-full h-10 inline-flex items-center justify-center text-xs font-medium text-[#ff3d00] hover:bg-[#ff3d00]/5 rounded-lg border border-gray-200 dark:border-slate-700 transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3d00]"
                  >
                    {isExpanded ? 'Hide Delivery Log' : 'View Delivery Log'}
                  </button>

                  {/* Expanded Delivery Log */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 animate-in fade-in">
                      <h4 className="text-[11px] font-medium text-[#60646c] dark:text-slate-500 uppercase tracking-wider mb-2">
                        Recent Branch Deliveries
                      </h4>

                      {movements.length === 0 ? (
                        <p className="text-xs text-[#60646c] dark:text-slate-500 italic py-2">
                          No distributions recorded for this branch yet.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {movements.map((m) => (
                            <div key={m.id} className="p-2.5 bg-[#f8fafc] dark:bg-slate-800/80 rounded-lg border border-gray-100 dark:border-slate-700/60 text-xs">
                              <div className="flex items-center justify-between font-medium text-gray-900 dark:text-white">
                                <span className="truncate max-w-[140px]">{m.product?.name}</span>
                                <span className="font-mono text-[#ff3d00]">
                                  {formatNumber(Math.abs(m.qty))} units
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-[#60646c] dark:text-slate-500 mt-0.5">
                                <span>{formatDate(m.recorded_at)}</span>
                                {m.selling_price != null && (
                                  <span className="font-mono text-gray-700 dark:text-slate-300">
                                    {formatCurrency(m.selling_price * Math.abs(m.qty))}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
