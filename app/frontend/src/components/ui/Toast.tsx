// Toast.tsx — Global toast notification system for user feedback
// Shows success, error, and info messages with auto-dismiss

'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    const newToast = { ...toast, id, duration: toast.duration || 5000 }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto dismiss
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto max-w-sm w-full bg-white dark:bg-slate-900 border rounded-2xl shadow-xl p-4
            transform transition-all duration-300 ease-in-out
            ${toast.type === 'success' ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' : ''}
            ${toast.type === 'error' ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300' : ''}
            ${toast.type === 'info' ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/90 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300' : ''}
          `}
        >
          <div className="flex items-start">
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && (
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
              )}
              {toast.type === 'error' && (
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold">✕</span>
              )}
              {toast.type === 'info' && (
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">ℹ</span>
              )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-xs font-medium leading-relaxed">
                {toast.message}
              </p>
            </div>
            <div className="shrink-0 ml-2">
              <button
                onClick={() => removeToast(toast.id)}
                className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 focus:outline-none transition-colors"
              >
                <span className="sr-only">Dismiss</span>
                <span className="text-base leading-none">&times;</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
