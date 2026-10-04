// profile/page.tsx — Enterprise Profile Settings, Credentials & Security Controls
// Features: Personal Details, Password Update, Theme Awareness & Danger Zone Confirmation

'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [username, setUsername] = useState(user?.username || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSave = async () => {
    setError('')
    setSuccess('')

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    if (newPassword && newPassword !== confirmNewPassword) {
      setError('New passwords do not match')
      return
    }
    if (newPassword && !currentPassword) {
      setError('Enter your current password to set a new one')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('charly_token')
      const payload: any = {}
      if (name.trim())     payload.name     = name.trim()
      if (email.trim())    payload.email    = email.trim()
      if (username.trim()) payload.username = username.trim()
      if (phone.trim())    payload.phone    = phone.trim()
      if (newPassword) {
        payload.current_password = currentPassword
        payload.new_password = newPassword
        payload.new_password_confirmation = confirmNewPassword
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Update failed')
        return
      }

      // Update stored user
      localStorage.setItem('charly_user', JSON.stringify(data.data))
      setSuccess('Profile updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Enter your password to confirm deletion')
      return
    }
    setDeleteLoading(true)
    setDeleteError('')
    try {
      const token = localStorage.getItem('charly_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/account`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ password: deletePassword }),
        }
      )
      const data = await response.json()
      if (!response.ok) {
        setDeleteError(data.message || 'Deletion failed')
        return
      }
      // Clear session and redirect
      localStorage.removeItem('charly_token')
      localStorage.removeItem('charly_user')
      router.replace('/login')
    } catch {
      setDeleteError('Could not connect to server.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  const inputClass = "w-full h-11 px-4 border border-gray-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
  const labelClass = "block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1"

  return (
    <div className="space-y-6 max-w-3xl pb-16 animate-in fade-in duration-300">
      
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Account & Profile Settings
        </h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Manage your personal credentials, contact info, and security credentials.
        </p>
      </div>

      {/* ── Profile header card ── */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
            <span className="text-white text-xl font-black">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs font-mono text-gray-400 dark:text-slate-500 truncate">
              {user?.email || user?.username || user?.phone}
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Active Tenant
        </span>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {success}
        </div>
      )}

      {/* ── Personal Info ── */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors space-y-4">
        <h3 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-slate-800">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="Optional" autoCapitalize="none" />
          </div>
          <div>
            <label className={labelClass}>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className={inputClass} placeholder="Optional" autoCapitalize="none" />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="Optional" />
          </div>
        </div>
      </div>

      {/* ── Change Password ── */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
            Password & Security
          </h3>
          <span className="text-[11px] text-gray-400 dark:text-slate-500">Leave blank to retain current password</span>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className={labelClass}>Current Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className={inputClass}
              placeholder="Required to change password"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                className={`${inputClass} ${confirmNewPassword && confirmNewPassword !== newPassword ? 'border-rose-400 dark:border-rose-500' : ''}`}
                placeholder="Repeat new password"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={e => setShowPasswords(e.target.checked)}
              className="rounded text-orange-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">Show password characters</span>
          </label>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="w-full sm:flex-1 h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 disabled:opacity-50 transition-all"
        >
          {loading ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full sm:w-auto px-6 h-11 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold rounded-xl active:scale-95 transition-all"
        >
          Sign Out
        </button>
      </div>

      {/* ── Danger Zone ── */}
      <div className="bg-white dark:bg-slate-900 border border-rose-200/60 dark:border-rose-900/40 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors space-y-3">
        <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider pb-2 border-b border-rose-100 dark:border-rose-900/40">
          Danger Zone
        </h3>

        {!showDeleteConfirm ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">Delete Account & Warehouse Data</p>
              <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                Permanently purge all catalog items, movements, distribution logs and history.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-rose-300 dark:border-rose-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold rounded-xl active:scale-95 transition-all self-start sm:self-auto"
            >
              Delete Account
            </button>
          </div>
        ) : (
          <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 sm:p-5 space-y-3">
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Irreversible Action</p>
            <p className="text-[11px] text-rose-500 dark:text-rose-300 leading-relaxed">
              All your products, branch stores, stock ledger movements, and audit reports will be permanently deleted.
              Enter your password to verify authorization.
            </p>
            {deleteError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">{deleteError}</p>
            )}
            <input
              type="password"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              className="w-full h-10 px-3.5 border border-rose-300 dark:border-rose-800 rounded-xl text-xs focus:outline-none focus:border-rose-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="Enter current password to authorize..."
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError('') }}
                className="flex-1 h-9 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-all shadow-xs"
              >
                {deleteLoading ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
