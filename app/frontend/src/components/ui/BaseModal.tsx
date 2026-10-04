// BaseModal.tsx — Reusable modal wrapper with Dark/Light theme support & Idempotency key tracking
import React, { useEffect } from 'react'
import { generateIdempotencyKey } from '@/lib/idempotency'
import { setIdempotencyKey, clearIdempotencyKey } from '@/lib/api'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'default' | 'wide'
}

export default function BaseModal({ isOpen, onClose, title, children, size = 'default' }: BaseModalProps) {
  // Generate a fresh idempotency key every time the modal opens
  useEffect(() => {
    if (isOpen) {
      const key = generateIdempotencyKey()
      setIdempotencyKey(key)
    } else {
      clearIdempotencyKey()
    }

    return () => {
      clearIdempotencyKey()
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClass = size === 'wide' ? 'md:max-w-lg lg:max-w-2xl' : 'md:max-w-md lg:max-w-lg'

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Bottom sheet on mobile, centered dialog on desktop */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-t md:border border-gray-200 dark:border-slate-800 rounded-t-2xl md:mx-auto md:rounded-lg md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 shadow-xl transition-colors duration-150 animate-in zoom-in-95 duration-200 ${sizeClass}`}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-2 md:hidden" />

        {/* Modal header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-base font-medium text-gray-900 dark:text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#60646c] dark:text-slate-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="px-5 sm:px-6 py-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
