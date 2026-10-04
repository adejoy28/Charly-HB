'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!name.trim()) { setError('Enter your full name'); return }
    if (!email && !username && !phone) { setError('Provide at least one identifier: email, username, or phone'); return }
    if (!password) { setError('Enter a secure password'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      await register({
        name: name.trim(),
        email: email.trim()    || undefined,
        username: username.trim() || undefined,
        phone: phone.trim()    || undefined,
        password,
        password_confirmation: confirmPassword,
      })
      router.replace('/')
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check input parameters.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col justify-center items-center px-4 py-12 transition-colors">
      
      {/* Container Box */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/25">
            <span className="text-white text-2xl font-black">C</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Create Account
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Register your warehouse tenant workspace on charlyHB
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-11 px-4 border border-gray-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="e.g. John Doe"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full h-11 px-4 border border-gray-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="e.g. johndoe"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-11 px-4 border border-gray-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="e.g. john@example.com"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full h-11 px-4 border border-gray-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="e.g. +234 801 234 5678"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Password (min. 6 characters) *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-11 px-4 pr-12 border border-gray-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Choose a strong password..."
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 active:opacity-70 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Confirm Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full h-11 px-4 border border-gray-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Re-type your password..."
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 active:opacity-90 disabled:opacity-50 transition-all mt-4"
          >
            {loading ? 'Creating Tenant...' : 'Create Account'}
          </button>
        </div>

        {/* Login link */}
        <p className="text-center text-xs text-gray-500 dark:text-slate-400 mt-6">
          Already registered?{' '}
          <Link href="/login" className="text-orange-500 hover:text-orange-600 font-bold transition-colors">
            Sign in to existing account
          </Link>
        </p>

      </div>
    </div>
  )
}
