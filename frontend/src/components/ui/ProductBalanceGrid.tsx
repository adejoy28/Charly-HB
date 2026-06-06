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
    if (balance === 0) return 'bg-red-50 text-red-500'
    if (balance <= 5) return 'bg-orange-50 text-orange-500'
    return 'bg-green-50 text-green-600'
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
          className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-orange-300 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {product.sku_code}
              </p>
              {product.cost_price > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Cost: ₦{formatNumber(product.cost_price)}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getBalancePillClass(product.balance)}`}>
              {getBalanceText(product.balance)}
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatNumber(product.balance)}
              </span>
              <span className="text-sm text-gray-500 ml-1">units</span>
            </div>
          </div>
        </div>
      ))}

      {products.length === 0 && (
        <div className="col-span-full bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl text-gray-400">📦</span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-sm text-gray-500">Add your first product to get started</p>
        </div>
      )}
    </div>
  )
}
