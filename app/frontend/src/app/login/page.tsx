'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [loginField, setLoginField] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async () => {
    if (!loginField || !password) {
      setError('Please fill in all fields')
      return
    }
    setError('')
    setLoading(true)
    try {
      await login(loginField, password)
      router.replace('/')
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col justify-center items-center px-4 py-12 transition-colors">
      
      {/* Container Box */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 sm:p-10 transition-all">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#ff3d00] rounded-lg flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-medium">C</span>
          </div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white tracking-tight">
            charly<span className="text-[#ff3d00]">HB</span>
          </h1>
          <p className="text-xs text-[#60646c] dark:text-slate-400 mt-1">
            Enterprise Stock Ledger & Multi-Tenant Platform
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="space-y-4">

          {/* Login field */}
          <div>
            <label className="block text-[11px] font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Email, Username, or Phone
            </label>
            <input
              type="text"
              value={loginField}
              onChange={e => setLoginField(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full h-10 px-4 border border-gray-200 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800/80 rounded-lg text-sm text-gray-900 dark:text-white placeholder-[#60646c] dark:placeholder-slate-500 focus:outline-none focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00] transition-colors"
              placeholder="e.g. adejoy or email..."
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-medium text-[#60646c] dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full h-10 px-4 pr-12 border border-gray-200 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800/80 rounded-lg text-sm text-gray-900 dark:text-white placeholder-[#60646c] dark:placeholder-slate-500 focus:outline-none focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00] transition-colors"
                placeholder="Enter your password..."
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#60646c] dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-300 active:opacity-70 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-10 bg-[#ff3d00] hover:bg-[#e03600] text-white text-sm font-medium rounded-lg active:scale-[0.98] disabled:opacity-50 transition-all mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3d00]"
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
          </button>

        </div>

        {/* Register link */}
        <p className="text-center text-xs text-[#60646c] dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#ff3d00] hover:underline font-medium transition-colors">
            Create tenant account
          </Link>
        </p>

      </div>
    </div>
  )
}
