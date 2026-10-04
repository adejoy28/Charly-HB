// ProductBalanceGrid.tsx — Grid of Product cards showing current balance
// Props: products (array), onProductClick (optional function)

import type { Product } from '@/types'

interface ProductBalanceGridProps {
  products: Product[]
  onProductClick?: (product: Product) => void
}

export default function ProductBalanceGrid({ products, onProductClick }: ProductBalanceGridProps) {
  const getBalanceText = (balance: number) => {
    if (balance === 0) return 'Out of Stock'
    if (balance <= 5) return 'Low Stock'
    return 'In Stock'
  }

  const getBalancePillClass = (balance: number) => {
    if (balance === 0) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
    if (balance <= 5) return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => onProductClick && onProductClick(product)}
          className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 cursor-pointer hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all shadow-xs"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight truncate">
                {product.name}
              </h3>
              <p className="text-xs font-mono text-gray-400 dark:text-slate-500 mt-1">
                {product.sku_code}
              </p>
              {product.cost_price > 0 && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Cost: <span className="font-mono font-semibold">₦{formatNumber(product.cost_price)}</span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${getBalancePillClass(product.balance)}`}>
              {getBalanceText(product.balance)}
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold font-mono tracking-tight text-gray-900 dark:text-white">
                {formatNumber(product.balance)}
              </span>
              <span className="text-xs font-medium text-gray-400 dark:text-slate-500 ml-1.5">cartons</span>
            </div>
          </div>
        </div>
      ))}

      {products.length === 0 && (
        <div className="col-span-full bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl text-gray-400">📦</span>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No products yet</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">Add your first product to get started</p>
        </div>
      )}
    </div>
  )
}
