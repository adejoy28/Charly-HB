// movements/page.tsx — Enterprise Stock Movements Audit Ledger
// Features: Advanced Multi-Parameter Filters, Dense Audit Table, Real-Time Badges & Direct CSV Export

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useStock } from '@/context/StockContext'
import { getMovements } from '@/lib/api'
import { formatDate, formatTime, formatNumber, formatCurrency, extractArray } from '@/lib/helpers'
import TypeBadge from '@/components/ui/TypeBadge'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import { FilterIcon, DownloadIcon, SearchIcon, RefreshCwIcon } from '@/components/ui/Icons'
import type { Product, Shop, Movement } from '@/types'

interface Filters {
  type: string
  product_id: string
  shop_id: string
  from: string
  to: string
}

export default function MovementsPage() {
  const { products, shops } = useStock()
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    product_id: '',
    shop_id: '',
    from: '',
    to: ''
  })

  const fetchMovements = async (pageNum = 1) => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      
      if (filters.type && filters.type !== 'all') {
        params.type = filters.type
      }
      if (filters.product_id) {
        params.product_id = filters.product_id
      }
      if (filters.shop_id) {
        params.shop_id = filters.shop_id
      }
      if (filters.from) {
        params.from = filters.from
      }
      if (filters.to) {
        params.to = filters.to
      }

      params.page = pageNum.toString()
      params.limit = '100'

      const response = await getMovements(params)
      const data = response.data

      if (pageNum === 1) {
        setMovements(extractArray<Movement>(data))
      } else {
        setMovements(prev => [...prev, ...extractArray<Movement>(data)])
      }

      setHasMore(data.meta?.has_more || false)
    } catch (error) {
      console.error('Failed to load movements:', error)
      setMovements([])
    } finally {
      setLoading(false)
    }
  }

  // Load movements when filters change
  useEffect(() => {
    setPage(1)
    fetchMovements(1)
  }, [filters])

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleExport = () => {
    if (filteredMovements.length === 0) return

    const headers = ['ID', 'Recorded At', 'User', 'Product', 'SKU', 'Type', 'Quantity', 'Valuation', 'Shop / Note', 'Status']
    const rows = filteredMovements.map(m => {
      const val = m.type === 'distribution' && m.selling_price != null ? (m.selling_price * Math.abs(m.qty)).toFixed(2) : ''
      return [
        m.id,
        m.recorded_at,
        m.recorded_by || '',
        `"${(m.product?.name || '').replace(/"/g, '""')}"`,
        m.product?.sku_code || '',
        m.type,
        m.qty,
        val,
        `"${(m.shop?.name || m.note || '').replace(/"/g, '""')}"`,
        m.status
      ]
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `charlyhb-movements-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return [
      filters.type !== 'all' ? 1 : 0,
      filters.product_id ? 1 : 0,
      filters.shop_id ? 1 : 0,
      filters.from ? 1 : 0,
      filters.to ? 1 : 0,
    ].reduce((a, b) => a + b, 0)
  }, [filters])

  const clearFilters = () => setFilters({
    type: 'all',
    product_id: '',
    shop_id: '',
    from: '',
    to: ''
  })

  // Filter in memory for instantaneous search query
  const filteredMovements = useMemo(() => {
    if (!searchQuery.trim()) return movements

    const q = searchQuery.toLowerCase()
    return movements.filter(m => 
      (m.product?.name && m.product.name.toLowerCase().includes(q)) ||
      (m.product?.sku_code && m.product.sku_code.toLowerCase().includes(q)) ||
      (m.shop?.name && m.shop.name.toLowerCase().includes(q)) ||
      (m.recorded_by && m.recorded_by.toLowerCase().includes(q)) ||
      (m.note && m.note.toLowerCase().includes(q))
    )
  }, [movements, searchQuery])

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-gray-900 dark:text-white">
              Stock Movement Ledger
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#f8fafc] dark:bg-slate-800 text-[#60646c] dark:text-slate-300 font-medium border border-gray-200 dark:border-slate-700 font-mono">
              {filteredMovements.length} records
            </span>
          </div>
          <p className="text-xs text-[#60646c] dark:text-slate-400 mt-1">
            Immutable transaction log of opening balances, receipts, shop dispatches, and spoil loss.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchMovements(1)}
            disabled={loading}
            title="Refresh movements"
            className="h-10 w-10 flex items-center justify-center text-[#60646c] dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-gray-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3d00]"
          >
            <RefreshCwIcon size={15} className={loading ? 'animate-spin text-[#ff3d00]' : ''} />
          </button>

          <button
            onClick={handleExport}
            disabled={filteredMovements.length === 0}
            className="h-10 inline-flex items-center gap-1.5 px-3.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3d00]"
          >
            <DownloadIcon size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`h-10 inline-flex items-center gap-1.5 px-3.5 text-xs font-medium rounded-lg border transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3d00] ${
              activeFilterCount > 0
                ? 'border-[#ff3d00] bg-[#ff3d00]/10 text-[#ff3d00]'
                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FilterIcon size={14} />
            <span>Filter Parameters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#ff3d00] text-white text-[10px] font-medium flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Search & Filter Drawer ── */}
      {filtersOpen && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-xs font-medium text-gray-900 dark:text-white uppercase tracking-wider">
              Filter Transaction Records
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#ff3d00] hover:underline font-medium"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Type */}
            <div>
              <label className="block text-[11px] font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1">
                Movement Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800/80 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00]"
              >
                <option value="all">All Movement Types</option>
                <option value="opening">Opening Stock</option>
                <option value="receipt">Inbound Receipt</option>
                <option value="distribution">Distribution to Shop</option>
                <option value="correction">Inventory Correction</option>
                <option value="spoil">Spoil / Damaged Loss</option>
              </select>
            </div>

            {/* Product */}
            <div>
              <label className="block text-[11px] font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1">
                Filter by Product
              </label>
              <select
                value={filters.product_id}
                onChange={(e) => handleFilterChange('product_id', e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800/80 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00]"
              >
                <option value="">All Catalog Products</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Shop */}
            <div>
              <label className="block text-[11px] font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1">
                Filter by Shop / Branch
              </label>
              <select
                value={filters.shop_id}
                onChange={(e) => handleFilterChange('shop_id', e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800/80 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00]"
              >
                <option value="">All Destination Shops</option>
                {shops.filter(s => !s.archived).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => handleFilterChange('from', e.target.value)}
                  className="w-full h-10 px-2.5 border border-gray-200 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800/80 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => handleFilterChange('to', e.target.value)}
                  className="w-full h-10 px-2.5 border border-gray-200 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800/80 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Movements Table & Search Toolbar ── */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
        
        {/* Search Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#60646c] dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product, shop, operator or note..."
              className="w-full h-10 pl-9 pr-4 text-xs bg-[#f8fafc] dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-[#60646c] dark:placeholder-slate-500 focus:outline-none focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00] transition-colors"
            />
          </div>

          <div className="text-xs text-[#60646c] dark:text-slate-400 font-medium">
            Showing <strong className="text-gray-900 dark:text-white font-medium">{filteredMovements.length}</strong> movements
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" rows={8} />
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon="📋"
              title="No Movement Records Found"
              description="No ledger entries match the selected filters or search terms."
              action={activeFilterCount > 0 ? {
                label: 'Clear Filters',
                onClick: clearFilters
              } : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-800/40 text-[11px] font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Timestamp</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Product & SKU</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Valuation</th>
                  <th className="py-3 px-4">Shop / Details</th>
                  <th className="py-3 px-4 sm:px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 text-xs">
                {filteredMovements.map((m) => {
                  const isPositive = m.qty > 0
                  return (
                    <tr 
                      key={m.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-slate-200">
                          {formatDate(m.recorded_at)}
                        </div>
                        <div className="text-[10px] text-[#60646c] dark:text-slate-500 font-mono">
                          {formatTime(m.recorded_at)}
                        </div>
                      </td>

                      {/* Operator */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-xs text-gray-700 dark:text-slate-300">
                          {m.recorded_by || 'System'}
                        </span>
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-slate-100 truncate max-w-[200px]">
                          {m.product?.name || 'Unknown'}
                        </div>
                        <div className="font-mono text-[10px] text-[#60646c] dark:text-slate-500">
                          {m.product?.sku_code || '—'}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <TypeBadge type={m.type} />
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-medium text-sm">
                        <span className={isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {isPositive ? '+' : ''}{formatNumber(m.qty)}
                        </span>
                      </td>

                      {/* Valuation */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-xs">
                        {m.type === 'distribution' && m.selling_price != null ? (
                          <div className="text-gray-900 dark:text-slate-200 font-medium">
                            {formatCurrency(m.selling_price * Math.abs(m.qty))}
                          </div>
                        ) : (
                          <span className="text-[#60646c] dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* Destination / Note */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-gray-800 dark:text-slate-300 font-medium truncate max-w-[180px]">
                          {m.shop?.name || m.note || '—'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                        {m.status === 'confirmed' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Confirmed
                          </span>
                        )}
                        {m.status === 'pending' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Pending Review
                          </span>
                        )}
                        {m.status === 'rejected' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  )
}
