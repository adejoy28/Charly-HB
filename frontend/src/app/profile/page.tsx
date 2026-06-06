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
      if (name.trim())    payload.name     = name.trim()
      if (email.trim())   payload.email    = email.trim()
      if (username.trim()) payload.username = username.trim()
      if (phone.trim())   payload.phone    = phone.trim()
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

  const inputClass = "w-full h-12 px-4 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
  const labelClass = "block text-xs text-gray-500 mb-1"

  return (
    <div className="space-y-4">
      {/* Profile header card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0">
          <span className="text-white text-xl font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-gray-900 truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">
            {user?.email || user?.username || user?.phone}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-500">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
          {success}
        </div>
      )}

      {/* Personal info */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Personal Info</h3>
        <div>
          <label className={labelClass}>Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="Optional" autoCapitalize="none" />
        </div>
        <div>
          <label className={labelClass}>Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className={inputClass} placeholder="Optional" autoCapitalize="none" />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="Optional" />
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Change Password <span className="text-gray-400 font-normal normal-case">(leave blank to keep current)</span>
        </h3>
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
            className={`${inputClass} ${confirmNewPassword && confirmNewPassword !== newPassword ? 'border-red-300' : ''}`}
            placeholder="Repeat new password"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showPasswords}
            onChange={e => setShowPasswords(e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-gray-500">Show passwords</span>
        </label>
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="w-full h-12 bg-orange-500 text-white text-sm font-semibold rounded-xl active:opacity-70 disabled:opacity-40"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

      {/* Sign out */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full h-12 border-2 border-red-200 text-red-500 text-sm font-semibold rounded-xl active:opacity-70"
      >
        Sign Out
      </button>

      {/* Danger zone */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Danger Zone</h3>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full h-12 border border-red-200 text-red-400 text-sm font-medium rounded-xl active:opacity-70"
          >
            Delete Account
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-red-600">This cannot be undone</p>
            <p className="text-xs text-red-500">
              All your products, shops, movements, and reports will be permanently deleted.
              Enter your password to confirm.
            </p>
            {deleteError && (
              <p className="text-xs text-red-500 font-medium">{deleteError}</p>
            )}
            <input
              type="password"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              className="w-full h-10 px-3 border border-red-300 rounded-xl text-sm focus:outline-none focus:border-red-500 bg-white"
              placeholder="Enter your password..."
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError('') }}
                className="flex-1 h-10 border border-gray-200 text-gray-600 text-sm rounded-xl active:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 h-10 bg-red-500 text-white text-sm font-semibold rounded-xl active:opacity-70 disabled:opacity-40"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
