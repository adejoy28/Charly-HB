// products/page.tsx — Enterprise Product Catalog & Inventory Valuation
// Features: Catalog KPI Stats, Real-Time Search, Fast Add/Edit Drawer, CSV Export & Stock Health Badges

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useStock } from '@/context/StockContext'
import { createProduct, updateProduct, deleteProduct } from '@/lib/api'
import { ApiErrorHandler } from '@/lib/errorHandler'
import { formatNumber, formatCurrency } from '@/lib/helpers'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import { SearchIcon, DownloadIcon, PlusIcon, PackageIcon, AlertTriangleIcon } from '@/components/ui/Icons'
import type { Product } from '@/types'

interface FormData {
  name: string
  sku_code: string
  cost_price: string
}

export default function ProductsPage() {
  const { products, refreshProducts, productsLoading } = useStock()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    sku_code: '',
    cost_price: ''
  })
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku_code && product.sku_code.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [products, searchTerm])

  // Catalog calculations
  const totalCatalogUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + (Number(p.balance) || 0), 0)
  }, [products])

  const totalCatalogCostValue = useMemo(() => {
    return products.reduce((acc, p) => acc + ((Number(p.balance) || 0) * (Number(p.cost_price) || 0)), 0)
  }, [products])

  const lowStockProductsCount = useMemo(() => {
    return products.filter(p => (Number(p.balance) || 0) <= 10).length
  }, [products])

  const handleExport = () => {
    if (filteredProducts.length === 0) return

    const headers = ['ID', 'Product Name', 'SKU Code', 'Cost Price', 'Current Balance', 'Total Valuation', 'Status']
    const rows = filteredProducts.map(p => {
      const bal = Number(p.balance) || 0
      const cost = Number(p.cost_price) || 0
      const val = bal * cost
      const status = bal === 0 ? 'Out of Stock' : bal <= 10 ? 'Low Stock' : 'Optimal'
      return [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.sku_code || '',
        cost.toFixed(2),
        bal,
        val.toFixed(2),
        status
      ]
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `charlyhb-products-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        sku_code: editingProduct.sku_code || '',
        cost_price: editingProduct.cost_price ? editingProduct.cost_price.toString() : ''
      })
    }
  }, [editingProduct])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')

    try {
      const data = {
        name: formData.name.trim(),
        sku_code: formData.sku_code.trim(),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, data)
      } else {
        await createProduct(data)
      }

      await refreshProducts()
      resetForm()
    } catch (err) {
      const apiError = ApiErrorHandler.handleError(err)
      
      if (ApiErrorHandler.isValidationError(apiError)) {
        setError(apiError.message)
      } else {
        setError('Failed to save product. Please check input values.')
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (product: Product) => {
    setDeleteError(null)
    
    try {
      await deleteProduct(product.id)
      await refreshProducts()
      setConfirmDelete(null)
    } catch (err) {
      const apiError = ApiErrorHandler.handleError(err)
      
      if (ApiErrorHandler.isConflictError(apiError)) {
        setDeleteError('Cannot delete product with existing movement records in ledger.')
      } else {
        setDeleteError('Failed to delete product. Please try again.')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      sku_code: '',
      cost_price: ''
    })
    setEditingProduct(null)
    setShowAddForm(false)
    setError('')
    setDeleteError(null)
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* ── Page Header & Catalog Metrics ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-gray-900 dark:text-white">
              Product Master Catalog
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ff3d00]/10 text-[#ff3d00] dark:text-[#ff5722] font-medium border border-[#ff3d00]/20 font-mono">
              {products.length} SKUs
            </span>
          </div>
          <p className="text-sm text-[#60646c] dark:text-slate-400 mt-1">
            Maintain item specifications, unit cost prices, and active on-hand inventory levels.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            disabled={filteredProducts.length === 0}
            className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 py-2 text-sm font-medium rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
          >
            <DownloadIcon size={15} />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={() => {
              if (showAddForm && !editingProduct) {
                resetForm()
              } else {
                resetForm()
                setShowAddForm(true)
              }
            }}
            className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 py-2 bg-[#ff3d00] hover:bg-[#e03600] active:scale-[0.98] text-white text-sm font-medium rounded-lg border border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff3d00]"
          >
            <PlusIcon size={15} />
            <span>{showAddForm && !editingProduct ? 'Close Form' : 'New Product'}</span>
          </button>
        </div>
      </div>

      {/* ── Summary Statistics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-gray-200 dark:border-slate-800 flex items-center gap-3.5 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <PackageIcon size={18} />
          </div>
          <div>
            <span className="text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider block">
              Units on Hand
            </span>
            <span className="text-2xl font-medium text-gray-900 dark:text-white font-mono mt-0.5 block">
              {totalCatalogUnits.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-gray-200 dark:border-slate-800 flex items-center gap-3.5 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-mono font-medium">
            ₦
          </div>
          <div>
            <span className="text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider block">
              Estimated Inventory Value
            </span>
            <span className="text-2xl font-medium text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {formatCurrency(totalCatalogCostValue)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-gray-200 dark:border-slate-800 flex items-center gap-3.5 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangleIcon size={18} />
          </div>
          <div>
            <span className="text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider block">
              Low / Depleted Stock
            </span>
            <span className={`text-2xl font-medium font-mono mt-0.5 block ${lowStockProductsCount > 0 ? 'text-amber-500' : 'text-[#60646c] dark:text-slate-400'}`}>
              {lowStockProductsCount} items
            </span>
          </div>
        </div>
      </div>

      {/* ── Product Create / Edit Card Drawer ── */}
      {(showAddForm || editingProduct) && (
        <div className="bg-white dark:bg-slate-900 border border-[#ff3d00]/30 dark:border-[#ff3d00]/20 rounded-lg p-5 sm:p-6 transition-all animate-in fade-in">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff3d00]" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Register New Catalog SKU'}
              </h3>
            </div>
            <button
              onClick={resetForm}
              className="text-xs text-[#60646c] hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Golden Penny Spaghetti 500g"
                  className="w-full h-10 px-3.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  SKU / Barcode Code *
                </label>
                <input
                  type="text"
                  value={formData.sku_code}
                  onChange={(e) => setFormData({ ...formData, sku_code: e.target.value })}
                  placeholder="e.g. GPS-500G"
                  className="w-full h-10 px-3.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00] transition-colors uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Unit Cost Price (₦)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  placeholder="0.00"
                  className="w-full h-10 px-3.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00] transition-colors font-mono"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={resetForm}
                className="min-h-[40px] px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg transition-colors active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="min-h-[40px] px-5 py-2 bg-[#ff3d00] hover:bg-[#e03600] active:scale-[0.98] text-white text-sm font-medium rounded-lg border border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff3d00]"
              >
                {formLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Save New Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Main Catalog Table Panel ── */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-none overflow-hidden transition-colors">
        
        {/* Search Bar Toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#60646c] dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by SKU code or title..."
              className="w-full h-10 pl-9 pr-4 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00] transition-colors"
            />
          </div>

          <div className="text-sm text-[#60646c] dark:text-slate-400 font-normal">
            Showing <strong className="font-medium text-gray-900 dark:text-white">{filteredProducts.length}</strong> of <strong className="font-medium text-gray-900 dark:text-white">{products.length}</strong> items
          </div>
        </div>

        {deleteError && (
          <div className="m-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400">
            {deleteError}
          </div>
        )}

        {productsLoading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" rows={6} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon="📦"
              title={searchTerm ? 'No matching products found' : 'Product catalog is empty'}
              description={searchTerm ? 'Try changing your search terms.' : 'Create your first product to begin tracking warehouse stock.'}
              action={!searchTerm ? {
                label: 'Create First Product',
                onClick: () => setShowAddForm(true)
              } : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-800/50 text-xs font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Product Description</th>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-right">Stock on Hand</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-sm">
                {filteredProducts.map((product) => {
                  const balance = Number(product.balance) || 0
                  const isDepleted = balance === 0
                  const isLow = balance > 0 && balance <= 10

                  return (
                    <tr 
                      key={product.id} 
                      className="hover:bg-[#f8fafc] dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Product Name */}
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-gray-900 dark:text-white">
                        <div className="truncate max-w-[260px]">{product.name}</div>
                      </td>

                      {/* SKU Code */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {product.sku_code}
                        </span>
                      </td>

                      {/* Cost Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-gray-900 dark:text-white">
                        {product.cost_price > 0 ? formatCurrency(product.cost_price) : <span className="text-[#60646c] dark:text-slate-500">—</span>}
                      </td>

                      {/* Balance */}
                      <td className="py-3.5 px-4 text-right font-mono font-medium">
                        <span className={
                          isDepleted ? 'text-rose-600 dark:text-rose-400 font-semibold' :
                          isLow ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        }>
                          {formatNumber(balance)} units
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isDepleted && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Out of Stock
                          </span>
                        )}
                        {isLow && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Low Stock
                          </span>
                        )}
                        {!isDepleted && !isLow && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Optimal
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-2.5 py-1 text-xs font-medium text-[#ff3d00] hover:bg-[#ff3d00]/10 rounded-md transition-colors active:scale-[0.98]"
                          >
                            Edit
                          </button>
                          
                          {confirmDelete === product.id ? (
                            <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 p-1 rounded-md border border-rose-200 dark:border-rose-900">
                              <button
                                onClick={() => handleDelete(product)}
                                className="px-2.5 py-1 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors active:scale-[0.98]"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-2 py-1 text-xs font-medium text-[#60646c] hover:text-gray-900 dark:hover:text-white transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(product.id)}
                              className="px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors active:scale-[0.98]"
                            >
                              Delete
                            </button>
                          )}
                        </div>
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
