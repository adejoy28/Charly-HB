// reports/page.tsx — Enterprise Period Reports, Distribution Analytics & Ledger Audits
// Features: Dynamic Time Horizons, Shop & SKU Breakdowns, Dark/Light Sticky Tables, CSV Data Export

'use client'

import { useState, useEffect } from 'react'
import { useStock } from '@/context/StockContext'
import {
  getReportSummary,
  getReportByShop,
  getReportByProduct,
  getReportSpoils
} from '@/lib/api'
import { formatNumber, formatCurrency, extractArray } from '@/lib/helpers'
import StatCard from '@/components/ui/StatCard'
import { DownloadIcon, FilterIcon } from '@/components/ui/Icons'
import type { ReportSummary } from '@/types'

export default function ReportsPage() {
  const { period, setPeriod, products, shops } = useStock()
  const [activeTab, setActiveTab] = useState<'summary' | 'byShop' | 'byProduct' | 'spoils'>('summary')
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const [summaryData, setSummaryData] = useState<ReportSummary | null>(null)
  const [byShopData, setByShopData] = useState<any[]>([])
  const [byProductData, setByProductData] = useState<any[]>([])
  const [spoilsData, setSpoilsData] = useState<any[]>([])

  const isCustomRange = !!(customFrom && customTo)

  const filterLabel = isCustomRange
    ? `${customFrom} → ${customTo}` 
    : period.charAt(0).toUpperCase() + period.slice(1)

  useEffect(() => {
    loadAllReports()
  }, [period, customFrom, customTo])

  const loadAllReports = async () => {
    setLoading(true)
    try {
      const params = isCustomRange
        ? { from: customFrom, to: customTo }
        : { period }

      const [summaryRes, byShopRes, byProductRes, spoilsRes] = await Promise.all([
        getReportSummary(params),
        getReportByShop(params),
        getReportByProduct(params),
        getReportSpoils(params),
      ])

      setSummaryData(summaryRes.data as ReportSummary)
      setByShopData(extractArray(byShopRes.data))
      setByProductData(extractArray(byProductRes.data))
      setSpoilsData(extractArray(spoilsRes.data))
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  // ─── CSV Export Functionality ──────────────────────────────────────────────────

  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    let csvContent = ''
    let filename = `report_${activeTab}_${timestamp}.csv`

    if (activeTab === 'summary') {
      const totalStockVal = products.reduce((sum, p) => sum + (p.cost_price || 0) * (p.balance || 0), 0)
      const headers = ['Metric', 'Value']
      const rows = [
        ['Opening Stock', summaryData?.total_opening || 0],
        ['Received Goods', summaryData?.total_received || 0],
        ['Distributed Cartons', Math.abs(summaryData?.total_distributed || 0)],
        ['Spoiled Cartons', summaryData?.total_spoiled || 0],
        ['Current Balance', summaryData?.current_balance || 0],
        ['Total Valuation (₦)', totalStockVal],
      ]
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    } else if (activeTab === 'byShop') {
      const headers = ['Shop Name', 'Total Cartons', 'Total Value (₦)', ...products.map(p => `"${p.name}"`)]
      const activeShops = shops.filter(s => !s.archived)
      const rows = activeShops.map(shop => {
        const sData = byShopData.find(item => item.shop?.id === shop.id)
        const movements: any[] = sData?.movements || []
        const productQty: Record<number, number> = {}
        movements.forEach((m: any) => {
          productQty[m.product_id] = (productQty[m.product_id] || 0) + Math.abs(m.qty)
        })
        const totalCartons = Object.values(productQty).reduce((a, b) => a + b, 0)
        const totalValue = products.reduce((sum, p) => sum + (productQty[p.id] || 0) * (p.cost_price || 0), 0)
        const productCols = products.map(p => productQty[p.id] || 0)
        return [`"${shop.name}"`, totalCartons, totalValue, ...productCols].join(',')
      })
      csvContent = [headers.join(','), ...rows].join('\n')
    } else if (activeTab === 'byProduct') {
      const headers = ['Product', 'SKU', 'Received', 'Distributed', 'Spoiled', 'Current Balance', 'Revenue (₦)', 'Cost (₦)', 'Gross Margin (₦)']
      const rows = products.map(product => {
        const pData = byProductData.find(item => item.product?.id === product.id)
        return [
          `"${product.name}"`,
          `"${product.sku_code || ''}"`,
          pData?.total_received || 0,
          Math.abs(pData?.total_distributed || 0),
          pData?.total_spoiled || 0,
          product.balance || 0,
          pData?.total_selling_value || 0,
          pData?.total_cost_value || 0,
          pData?.gross_margin || 0
        ].join(',')
      })
      csvContent = [headers.join(','), ...rows].join('\n')
    } else if (activeTab === 'spoils') {
      const headers = ['Product', 'SKU', 'Damaged', 'Expired', 'Returned', 'Total Spoils']
      const rows = spoilsData.map(spoil => [
        `"${spoil.product?.name || ''}"`,
        `"${spoil.product?.sku_code || ''}"`,
        spoil.damaged_qty || 0,
        spoil.expired_qty || 0,
        spoil.returned_qty || 0,
        spoil.total || 0
      ].join(','))
      csvContent = [headers.join(','), ...rows].join('\n')
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ─── Summary Section ──────────────────────────────────────────────────────────

  const SummarySection = () => {
    const totalStockValue = products.reduce(
      (sum, p) => sum + (p.cost_price || 0) * (p.balance || 0),
      0
    )

    return (
      <div className="space-y-4">
        {/* Stat grid — 2 col on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard label="Opening" value={summaryData?.total_opening || 0} color="orange" />
          <StatCard label="Received" value={summaryData?.total_received || 0} color="green" />
          <StatCard label="Distributed" value={Math.abs(summaryData?.total_distributed || 0)} color="orange" />
          <StatCard label="Spoiled" value={summaryData?.total_spoiled || 0} color="red" />
          <StatCard label="Balance" value={summaryData?.current_balance || 0} color="green" />
        </div>

        {/* Total stock value card */}
        {totalStockValue > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Total Inventory Valuation
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-gray-900 dark:text-white">
                {formatCurrency(totalStockValue)}
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                Calculated as unit cost price × current warehouse balance
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-mono font-semibold text-gray-700 dark:text-slate-300">
                {products.length} Products Monitored
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── By Shop Section ──────────────────────────────────────────────────────────

  const ByShopSection = () => {
    const activeShops = shops.filter(s => !s.archived)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
            Branch Distribution Matrix
          </p>
          <span className="text-xs font-mono text-gray-400 dark:text-slate-500">
            {activeShops.length} active branches
          </span>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {activeShops.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-xs text-gray-500 dark:text-slate-400">No active branches configured</p>
            </div>
          )}
          {activeShops.map(shop => {
            const shopData = byShopData.find(item => item.shop?.id === shop.id)
            const movements: any[] = shopData?.movements || []
            const totalCartons = movements.reduce((sum: number, m: any) => sum + Math.abs(m.qty), 0)

            const byProduct: Record<number, { name: string; qty: number; cost_price: number }> = {}
            movements.forEach((m: any) => {
              const pid = m.product_id
              if (!byProduct[pid]) {
                byProduct[pid] = {
                  name: m.product?.name || '',
                  qty: 0,
                  cost_price: m.product?.cost_price || 0,
                }
              }
              byProduct[pid].qty += Math.abs(m.qty)
            })

            const totalValue = Object.values(byProduct).reduce(
              (sum, p) => sum + p.qty * p.cost_price, 0
            )

            return (
              <div key={shop.id} className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{shop.name}</p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500">Branch Outlet</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-extrabold font-mono text-orange-500">
                      {formatNumber(totalCartons)}
                      <span className="text-[11px] font-normal text-gray-400 dark:text-slate-500 ml-1">ctns</span>
                    </p>
                    {totalValue > 0 && (
                      <p className="text-xs font-mono font-semibold text-gray-600 dark:text-slate-400">{formatCurrency(totalValue)}</p>
                    )}
                  </div>
                </div>
                {Object.entries(byProduct).length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {Object.entries(byProduct).map(([pid, data]) => (
                      <div key={pid} className="flex justify-between items-center py-1 border-t border-gray-50 dark:border-slate-800/40 text-xs">
                        <span className="text-gray-600 dark:text-slate-400">{data.name}</span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-gray-900 dark:text-white">{formatNumber(data.qty)}</span>
                          {data.cost_price > 0 && (
                            <span className="font-mono text-gray-400 dark:text-slate-500 ml-2">
                              {formatCurrency(data.qty * data.cost_price)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-slate-500 pt-1">
                    No distributions recorded for this time range.
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
          <div className="relative">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/80 dark:divide-slate-800">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 min-w-[160px]">
                      Branch Shop
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Total Cartons
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Total Value
                    </th>
                    {products.map(p => (
                      <th key={p.id} className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800/60">
                  {activeShops.map(shop => {
                    const shopData = byShopData.find(item => item.shop?.id === shop.id)
                    const movements: any[] = shopData?.movements || []

                    const productQty: Record<number, number> = {}
                    movements.forEach((m: any) => {
                      productQty[m.product_id] = (productQty[m.product_id] || 0) + Math.abs(m.qty)
                    })

                    const totalCartons = Object.values(productQty).reduce((a, b) => a + b, 0)
                    const totalValue = products.reduce((sum, p) => {
                      return sum + (productQty[p.id] || 0) * (p.cost_price || 0)
                    }, 0)

                    return (
                      <tr key={shop.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 lg:px-6 py-3 sticky left-0 bg-white dark:bg-slate-900 z-10">
                          <span className="text-xs font-bold text-gray-900 dark:text-white whitespace-nowrap">{shop.name}</span>
                        </td>
                        <td className="px-4 lg:px-6 py-3">
                          <span className="text-xs font-mono font-bold text-orange-500">{formatNumber(totalCartons)}</span>
                        </td>
                        <td className="px-4 lg:px-6 py-3">
                          <span className="text-xs font-mono font-semibold text-gray-700 dark:text-slate-300">
                            {totalValue > 0 ? formatCurrency(totalValue) : '—'}
                          </span>
                        </td>
                        {products.map(p => (
                          <td key={p.id} className="px-4 lg:px-6 py-3">
                            <span className="text-xs font-mono text-gray-700 dark:text-slate-300">{formatNumber(productQty[p.id] || 0)}</span>
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    )
  }

  // ─── By Product Section ───────────────────────────────────────────────────────

  const ByProductSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
          SKU Movement & Margin Breakdown
        </p>
        <span className="text-xs font-mono text-gray-400 dark:text-slate-500">
          {products.length} catalog items
        </span>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {products.map(product => {
          const productData = byProductData.find(item => item.product?.id === product.id)
          const received = productData?.total_received || 0
          const distributed = Math.abs(productData?.total_distributed || 0)
          const spoiled = productData?.total_spoiled || 0

          return (
            <div key={product.id} className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
              <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{product.name}</p>
                  <p className="text-[11px] font-mono text-gray-400 dark:text-slate-500">{product.sku_code}</p>
                </div>
                <div className={`text-base font-extrabold font-mono ${
                  product.balance === 0 ? 'text-rose-500' :
                  product.balance <= 5 ? 'text-orange-500' : 'text-emerald-500'
                }`}>
                  {formatNumber(product.balance)} <span className="text-xs font-normal text-gray-400">bal</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold">Received</p>
                  <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatNumber(received)}</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold">Distributed</p>
                  <p className="text-xs font-mono font-bold text-orange-500 mt-0.5">{formatNumber(distributed)}</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold">Spoiled</p>
                  <p className="text-xs font-mono font-bold text-rose-500 mt-0.5">{formatNumber(spoiled)}</p>
                </div>
              </div>

              {productData?.total_selling_value > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 dark:text-slate-500">Revenue</span>
                    <span className="font-mono font-bold text-orange-500">
                      {formatCurrency(productData.total_selling_value)}
                    </span>
                  </div>
                  {productData.total_cost_value > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 dark:text-slate-500">Cost of Goods</span>
                      <span className="font-mono text-gray-600 dark:text-slate-400">
                        {formatCurrency(productData.total_cost_value)}
                      </span>
                    </div>
                  )}
                  {productData.gross_margin > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 dark:text-slate-500">Gross Margin</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(productData.gross_margin)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
        <div className="relative">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/80 dark:divide-slate-800">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 min-w-[160px]">
                    Product
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Received
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Distributed
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Spoiled
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Margin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800/60">
                {products.map(product => {
                  const productData = byProductData.find(item => item.product?.id === product.id)
                  const received = productData?.total_received || 0
                  const distributed = Math.abs(productData?.total_distributed || 0)
                  const spoiled = productData?.total_spoiled || 0

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 lg:px-6 py-3 sticky left-0 bg-white dark:bg-slate-900 z-10">
                        <p className="text-xs font-bold text-gray-900 dark:text-white whitespace-nowrap">{product.name}</p>
                        <p className="text-[11px] font-mono text-gray-400 dark:text-slate-500">{product.sku_code}</p>
                      </td>
                      <td className="px-4 lg:px-6 py-3"><span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(received)}</span></td>
                      <td className="px-4 lg:px-6 py-3"><span className="text-xs font-mono font-bold text-orange-500">{formatNumber(distributed)}</span></td>
                      <td className="px-4 lg:px-6 py-3"><span className="text-xs font-mono font-bold text-rose-500">{formatNumber(spoiled)}</span></td>
                      <td className="px-4 lg:px-6 py-3">
                        <span className={`text-xs font-mono font-bold ${
                          product.balance === 0 ? 'text-rose-500' :
                          product.balance <= 5 ? 'text-orange-500' : 'text-emerald-500'
                        }`}>
                          {formatNumber(product.balance)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3">
                        <span className="text-xs font-mono font-bold text-orange-500">
                          {productData?.total_selling_value ? formatCurrency(productData.total_selling_value) : '—'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3">
                        <span className="text-xs font-mono text-gray-600 dark:text-slate-400">
                          {productData?.total_cost_value ? formatCurrency(productData.total_cost_value) : '—'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3">
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {productData?.gross_margin ? formatCurrency(productData.gross_margin) : '—'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  )

  // ─── Spoils Section ───────────────────────────────────────────────────────────

  const SpoilsSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
          Spoil Loss Breakdown by Reason
        </p>
        <span className="text-xs font-mono text-gray-400 dark:text-slate-500">
          {spoilsData.length} records in range
        </span>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {spoilsData.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-xs text-gray-500 dark:text-slate-400">No spoils recorded in this period</p>
          </div>
        )}
        {spoilsData.map(spoil => (
          <div key={spoil.product?.id} className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{spoil.product?.name}</p>
                <p className="text-[11px] font-mono text-gray-400 dark:text-slate-500">{spoil.product?.sku_code}</p>
              </div>
              <p className="text-base font-extrabold font-mono text-rose-500">
                {formatNumber(spoil.total || 0)}
                <span className="text-xs font-normal text-gray-400 dark:text-slate-500 ml-1">total</span>
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold">Damaged</p>
                <p className="text-xs font-mono font-bold text-orange-500 mt-0.5">{formatNumber(spoil.damaged_qty || 0)}</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold">Expired</p>
                <p className="text-xs font-mono font-bold text-rose-500 mt-0.5">{formatNumber(spoil.expired_qty || 0)}</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold">Returned</p>
                <p className="text-xs font-mono font-bold text-gray-600 dark:text-slate-400 mt-0.5">{formatNumber(spoil.returned_qty || 0)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
        <table className="min-w-full divide-y divide-gray-200/80 dark:divide-slate-800">
          <thead className="bg-slate-50/80 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Damaged (Transit)
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Expired (Shelf)
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Defective Return
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Total Lost
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800/60">
            {spoilsData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-gray-400 dark:text-slate-500">
                  No spoils recorded in this period
                </td>
              </tr>
            )}
            {spoilsData.map(spoil => (
              <tr key={spoil.product?.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 lg:px-6 py-3">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{spoil.product?.name}</p>
                  <p className="text-[11px] font-mono text-gray-400 dark:text-slate-500">{spoil.product?.sku_code}</p>
                </td>
                <td className="px-4 lg:px-6 py-3"><span className="text-xs font-mono font-bold text-orange-500">{formatNumber(spoil.damaged_qty || 0)}</span></td>
                <td className="px-4 lg:px-6 py-3"><span className="text-xs font-mono font-bold text-rose-500">{formatNumber(spoil.expired_qty || 0)}</span></td>
                <td className="px-4 lg:px-6 py-3"><span className="text-xs font-mono text-gray-600 dark:text-slate-400">{formatNumber(spoil.returned_qty || 0)}</span></td>
                <td className="px-4 lg:px-6 py-3"><span className="text-xs font-mono font-extrabold text-rose-600 dark:text-rose-400">{formatNumber(spoil.total || 0)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ─── Tabs ────────────────────────────────────────────────────────────────────

  const tabs: { id: 'summary' | 'byShop' | 'byProduct' | 'spoils'; label: string; component: () => React.JSX.Element }[] = [
    { id: 'summary', label: 'Summary', component: SummarySection },
    { id: 'byShop', label: 'By Shop', component: ByShopSection },
    { id: 'byProduct', label: 'By Product', component: ByProductSection },
    { id: 'spoils', label: 'Spoils', component: SpoilsSection },
  ]

  // ─── Loading state ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 pb-12 animate-in fade-in duration-300">
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Reports & Audit Analytics
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 font-mono">
              {filterLabel}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Aggregate inventory throughput, shop distribution metrics, and spoil audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Custom Date Range Filter Toggle */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              isCustomRange || filterOpen
                ? 'border-orange-500 text-orange-500 bg-orange-500/10'
                : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FilterIcon size={14} />
            <span>{filterLabel}</span>
          </button>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
            title="Export Report CSV"
          >
            <DownloadIcon size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* ── Collapsible Date Filter Panel ── */}
      {filterOpen && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 transition-all animate-in fade-in">
          {/* Quick period pills */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              Preset Horizon
            </p>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'Last 7 Days' },
                { id: 'month', label: 'Last 30 Days' },
                { id: 'all', label: 'All History' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPeriod(p.id)
                    setCustomFrom('')
                    setCustomTo('')
                  }}
                  className={`text-xs font-semibold rounded-xl px-3.5 py-2 transition-all active:scale-95 ${
                    period === p.id && !isCustomRange
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom date range inputs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Custom Date Window
              </p>
              {isCustomRange && (
                <button
                  onClick={() => { setCustomFrom(''); setCustomTo('') }}
                  className="text-xs text-orange-500 hover:text-orange-600 font-semibold"
                >
                  Clear Window
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-gray-400 dark:text-slate-500 mb-1 font-medium">Start Date</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 dark:text-slate-500 mb-1 font-medium">End Date</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 pt-2 flex justify-end">
            <button
              onClick={() => setFilterOpen(false)}
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
            >
              Done Filtering
            </button>
          </div>
        </div>
      )}

      {/* ── Segmented Tab Navigation ── */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[90px] py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Active Tab Content ── */}
      {ActiveComponent && <ActiveComponent />}
    </div>
  )
}
