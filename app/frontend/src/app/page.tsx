// page.tsx — Full-Suite Enterprise Inventory Dashboard & Live Ledger
// Features: Executive KPIs, Stock Velocity Sparkline, Live Inventory Table with Search, Status Filters & One-Click CSV Export

'use client'

import { useState, useMemo } from 'react'
import { useStock } from '@/context/StockContext'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import {
  SearchIcon,
  DownloadIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  PackageIcon,
  PlusIcon,
  ArrowUpDownIcon,
  FilterIcon
} from '@/components/ui/Icons'

type FilterStatus = 'all' | 'optimal' | 'low' | 'depleted'
type SortField = 'name' | 'sku' | 'balance'
type SortOrder = 'asc' | 'desc'

export default function Home() {
  const { 
    period, 
    handleQuickAction, 
    reportSummary,
    loading,
    products,
    pendingSpoilsCount
  } = useStock()

  // Table State: Search, Filter, Sort
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [sortField, setSortField] = useState<SortField>('balance')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Total balance computation
  const totalStockUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + (Number(p.balance) || 0), 0)
  }, [products])

  const lowStockCount = useMemo(() => {
    return products.filter(p => (Number(p.balance) || 0) > 0 && (Number(p.balance) || 0) <= 10).length
  }, [products])

  const outOfStockCount = useMemo(() => {
    return products.filter(p => (Number(p.balance) || 0) === 0).length
  }, [products])

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.sku_code && p.sku_code.toLowerCase().includes(searchQuery.toLowerCase()))
        
        const balance = Number(p.balance) || 0
        let matchesStatus = true
        if (statusFilter === 'optimal') matchesStatus = balance > 10
        if (statusFilter === 'low') matchesStatus = balance > 0 && balance <= 10
        if (statusFilter === 'depleted') matchesStatus = balance === 0

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        let valA: string | number = a.name
        let valB: string | number = b.name

        if (sortField === 'sku') {
          valA = a.sku_code || ''
          valB = b.sku_code || ''
        } else if (sortField === 'balance') {
          valA = Number(a.balance) || 0
          valB = Number(b.balance) || 0
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
  }, [products, searchQuery, statusFilter, sortField, sortOrder])

  // Toggle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder(field === 'balance' ? 'desc' : 'asc')
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) return

    const headers = ['ID', 'Product Name', 'SKU Code', 'Unit', 'Current Balance', 'Health Status']
    const rows = filteredProducts.map(p => {
      const bal = Number(p.balance) || 0
      const status = bal === 0 ? 'Out of Stock' : bal <= 10 ? 'Low Stock' : 'Optimal'
      return [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.sku_code || '',
        p.unit_type || 'units',
        bal,
        status
      ]
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `charlyhb-inventory-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <LoadingSkeleton type="dashboard" />
  }

  // KPI Calculations
  const totalOpening = reportSummary?.total_opening || 0
  const totalReceived = reportSummary?.total_received || 0
  const totalDistributed = reportSummary?.total_distributed || 0
  const totalSpoiled = reportSummary?.total_spoiled || 0

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* ── Executive Hero Banner ── */}
      <div className="relative overflow-hidden rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white p-6 sm:p-8 border border-gray-200 dark:border-slate-800 transition-colors">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#ff3d00]/5 dark:bg-[#ff3d00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff3d00]/10 text-[#ff3d00] dark:text-[#ff5722] text-xs font-medium uppercase tracking-wider mb-3 border border-[#ff3d00]/20 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3d00] animate-pulse" />
              Warehouse Live Terminal
            </div>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-gray-900 dark:text-white">
              Inventory & Distribution Hub
            </h2>
            <p className="text-sm text-[#60646c] dark:text-slate-400 mt-1 max-w-xl">
              Real-time stock flow, ledger reconciliation, and multi-tenant warehouse visibility.
            </p>
          </div>

          {/* Quick Metrics Badge Strip */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#f8fafc] dark:bg-slate-800/80 px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700">
              <span className="text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider block">Catalog SKUs</span>
              <span className="text-xl font-medium text-gray-900 dark:text-white font-mono mt-0.5 block">{products.length}</span>
            </div>
            <div className="bg-[#f8fafc] dark:bg-slate-800/80 px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700">
              <span className="text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider block">Stock on Hand</span>
              <span className="text-xl font-medium text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">{totalStockUnits.toLocaleString()}</span>
            </div>
            <div className="bg-[#f8fafc] dark:bg-slate-800/80 px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700">
              <span className="text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider block">Attention SKUs</span>
              <span className={`text-xl font-medium font-mono mt-0.5 block ${lowStockCount + outOfStockCount > 0 ? 'text-amber-500' : 'text-[#60646c] dark:text-slate-400'}`}>
                {lowStockCount + outOfStockCount}
              </span>
            </div>
          </div>
        </div>

        {/* Pending Spoils Notification Ribbon */}
        {pendingSpoilsCount > 0 && (
          <div className="mt-6 flex items-center justify-between p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-800 dark:text-rose-300 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />
              <span>
                <strong className="font-medium">{pendingSpoilsCount} pending spoil item{pendingSpoilsCount > 1 ? 's' : ''}</strong> require verification before ledger deduction.
              </span>
            </div>
            <button
              onClick={() => handleQuickAction('spoil')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-medium text-xs rounded-md transition-colors shadow-none shrink-0"
            >
              Review Queue
            </button>
          </div>
        )}
      </div>

      {/* ── Executive KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Opening Stock */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-gray-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between text-[#60646c] dark:text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Opening Stock</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PackageIcon size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-white font-mono tracking-tight">
            {totalOpening.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#60646c] dark:text-slate-400">
            <span className="font-medium text-blue-600 dark:text-blue-400">Base inventory</span>
            <span>for period ({period})</span>
          </div>
        </div>

        {/* 2. Inbound Receipts */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-gray-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between text-[#60646c] dark:text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Received Goods</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeftIcon size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-medium text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            +{totalReceived.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#60646c] dark:text-slate-400">
            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUpIcon size={14} className="mr-0.5" /> Inbound
            </span>
            <span>restocked to warehouse</span>
          </div>
        </div>

        {/* 3. Outbound Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-gray-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between text-[#60646c] dark:text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Distributed</span>
            <div className="w-8 h-8 rounded-lg bg-[#ff3d00]/10 text-[#ff3d00] dark:text-[#ff5722] flex items-center justify-center">
              <ArrowUpRightIcon size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-medium text-[#ff3d00] dark:text-[#ff5722] font-mono tracking-tight">
            -{totalDistributed.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#60646c] dark:text-slate-400">
            <span className="font-medium text-[#ff3d00] dark:text-[#ff5722]">Outbound dispatch</span>
            <span>to shop branches</span>
          </div>
        </div>

        {/* 4. Spoiled / Damaged */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-gray-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between text-[#60646c] dark:text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Spoiled / Damaged</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangleIcon size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-medium text-rose-600 dark:text-rose-400 font-mono tracking-tight">
            {totalSpoiled.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#60646c] dark:text-slate-400">
            <span className={`font-medium ${totalSpoiled > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {totalSpoiled > 0 ? 'Recorded loss' : 'Zero loss'}
            </span>
            <span>in selected window</span>
          </div>
        </div>

      </div>

      {/* ── Operational Command Bar (Action Shortcuts) ── */}
      {/* ── Operational Command Bar (Action Shortcuts) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-gray-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider">
              Quick Operations Command
            </h3>
            <p className="text-xs text-[#60646c] dark:text-slate-400 mt-0.5">
              Launch atomic ledger transactions with pessimistic concurrency locking.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            onClick={() => handleQuickAction('opening')}
            className="group flex flex-col p-4 bg-[#f8fafc] dark:bg-slate-800/60 hover:bg-blue-50/80 dark:hover:bg-blue-950/30 border border-gray-200 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-700 rounded-lg text-left transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
              <span className="text-[10px] font-mono text-[#60646c] dark:text-slate-500">SET</span>
            </div>
            <span className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Opening Stock
            </span>
            <span className="text-xs text-[#60646c] dark:text-slate-400 mt-0.5 leading-snug">
              Set starting day balance
            </span>
          </button>

          <button
            onClick={() => handleQuickAction('receipt')}
            className="group flex flex-col p-4 bg-[#f8fafc] dark:bg-slate-800/60 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30 border border-gray-200 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-lg text-left transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
              <span className="text-[10px] font-mono text-[#60646c] dark:text-slate-500">INBOUND</span>
            </div>
            <span className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Receive Goods
            </span>
            <span className="text-xs text-[#60646c] dark:text-slate-400 mt-0.5 leading-snug">
              Record incoming shipment
            </span>
          </button>

          <button
            onClick={() => handleQuickAction('distribution')}
            className="group flex flex-col p-4 bg-[#f8fafc] dark:bg-slate-800/60 hover:bg-orange-50/80 dark:hover:bg-orange-950/30 border border-gray-200 dark:border-slate-700/60 hover:border-orange-300 dark:hover:border-orange-700 rounded-lg text-left transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-2 h-2 rounded-full bg-[#ff3d00] group-hover:scale-125 transition-transform" />
              <span className="text-[10px] font-mono text-[#60646c] dark:text-slate-500">DISPATCH</span>
            </div>
            <span className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-[#ff3d00] dark:group-hover:text-[#ff5722]">
              Distribute
            </span>
            <span className="text-xs text-[#60646c] dark:text-slate-400 mt-0.5 leading-snug">
              Deliver stock to shops
            </span>
          </button>

          <button
            onClick={() => handleQuickAction('spoil')}
            className="group flex flex-col p-4 bg-[#f8fafc] dark:bg-slate-800/60 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 border border-gray-200 dark:border-slate-700/60 hover:border-rose-300 dark:hover:border-rose-700 rounded-lg text-left transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 group-hover:scale-125 transition-transform" />
              <span className="text-[10px] font-mono text-[#60646c] dark:text-slate-500">LOSS</span>
            </div>
            <span className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400">
              Record Spoil
            </span>
            <span className="text-xs text-[#60646c] dark:text-slate-400 mt-0.5 leading-snug">
              Damaged / expired loss
            </span>
          </button>

          <button
            onClick={() => handleQuickAction('correction')}
            className="group flex flex-col p-4 bg-[#f8fafc] dark:bg-slate-800/60 hover:bg-purple-50/80 dark:hover:bg-purple-950/30 border border-gray-200 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-700 rounded-lg text-left transition-all active:scale-[0.98] col-span-2 md:col-span-1"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 group-hover:scale-125 transition-transform" />
              <span className="text-[10px] font-mono text-[#60646c] dark:text-slate-500">AUDIT</span>
            </div>
            <span className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
              Correction
            </span>
            <span className="text-xs text-[#60646c] dark:text-slate-400 mt-0.5 leading-snug">
              Reconcile discrepancy
            </span>
          </button>
        </div>
      </div>

      {/* ── Enterprise Master Inventory Table & Filter Toolbar ── */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 shadow-none overflow-hidden transition-colors">
        
        {/* Table Header & Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                Master Inventory Ledger
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium font-mono">
                {filteredProducts.length} items
              </span>
            </div>
            <p className="text-xs text-[#60646c] dark:text-slate-400 mt-0.5">
              Live calculated on-hand balances with real-time health categorisation.
            </p>
          </div>

          {/* Search, Status Tabs & CSV Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#60646c] dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search SKU or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00] transition-colors"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs font-medium'
                    : 'text-[#60646c] dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('optimal')}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                  statusFilter === 'optimal'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-medium'
                    : 'text-[#60646c] dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                In Stock
              </button>
              <button
                onClick={() => setStatusFilter('low')}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                  statusFilter === 'low'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-medium'
                    : 'text-[#60646c] dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Low ({lowStockCount})
              </button>
              <button
                onClick={() => setStatusFilter('depleted')}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                  statusFilter === 'depleted'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs font-medium'
                    : 'text-[#60646c] dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Out ({outOfStockCount})
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              disabled={filteredProducts.length === 0}
              className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 py-2 text-sm font-medium rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
            >
              <DownloadIcon size={14} />
              <span>Export CSV</span>
            </button>

          </div>
        </div>

        {/* Dense Responsive Data Table */}
        {products.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon="📦"
              title="No Products Configured"
              description="Initialise your product catalog or set daily opening balances to populate the ledger."
              action={{
                label: 'Set Opening Stock',
                onClick: () => handleQuickAction('opening'),
              }}
            />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">No matching products found</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  <th 
                    onClick={() => handleSort('name')}
                    className="py-3 px-4 sm:px-6 cursor-pointer hover:text-gray-900 dark:hover:text-white select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Product & Description</span>
                      <ArrowUpDownIcon size={12} className={sortField === 'name' ? 'text-orange-500' : 'text-gray-400'} />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('sku')}
                    className="py-3 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>SKU Code</span>
                      <ArrowUpDownIcon size={12} className={sortField === 'sku' ? 'text-orange-500' : 'text-gray-400'} />
                    </div>
                  </th>
                  <th className="py-3 px-4">Unit Type</th>
                  <th 
                    onClick={() => handleSort('balance')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-gray-900 dark:hover:text-white select-none"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Current Balance</span>
                      <ArrowUpDownIcon size={12} className={sortField === 'balance' ? 'text-orange-500' : 'text-gray-400'} />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Quick Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 text-xs">
                {filteredProducts.map((p) => {
                  const balance = Number(p.balance) || 0
                  const isDepleted = balance === 0
                  const isLow = balance > 0 && balance <= 10
                  const isOptimal = balance > 10

                  return (
                    <tr 
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Product Name */}
                      <td className="py-3 px-4 sm:px-6">
                        <div className="font-semibold text-gray-900 dark:text-slate-100 truncate max-w-[240px]">
                          {p.name}
                        </div>
                        {p.description && (
                          <div className="text-[11px] text-gray-400 dark:text-slate-500 truncate max-w-[240px]">
                            {p.description}
                          </div>
                        )}
                      </td>

                      {/* SKU Code */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {p.sku_code || '—'}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-4 text-gray-500 dark:text-slate-400 capitalize">
                        {p.unit_type || 'units'}
                      </td>

                      {/* Current Balance */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                        <span className={
                          isDepleted ? 'text-rose-500 font-extrabold' :
                          isLow ? 'text-amber-500 font-extrabold' : 'text-emerald-600 dark:text-emerald-400'
                        }>
                          {balance.toLocaleString()}
                        </span>
                      </td>

                      {/* Health Status Badge */}
                      <td className="py-3 px-4 text-center">
                        {isDepleted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Depleted
                          </span>
                        )}
                        {isLow && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Low Stock
                          </span>
                        )}
                        {isOptimal && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Optimal
                          </span>
                        )}
                      </td>

                      {/* Quick Action Button */}
                      <td className="py-3 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleQuickAction('receipt')}
                            title="Receive Stock"
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
                          >
                            <PlusIcon size={14} />
                          </button>
                          <button
                            onClick={() => handleQuickAction('distribution')}
                            title="Distribute to Shop"
                            className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg transition-colors"
                          >
                            <ArrowUpRightIcon size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 border-t border-gray-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span>
            Displaying <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> total catalog items.
          </span>
          <span className="font-mono text-[11px]">
            Aggregated Total: <strong className="text-gray-900 dark:text-white">{totalStockUnits.toLocaleString()} units</strong>
          </span>
        </div>

      </div>

    </div>
  )
}
