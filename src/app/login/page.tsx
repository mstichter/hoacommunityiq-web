'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://sdcvfxontkwfvcezsilm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkY3ZmeG9udGt3ZnZjZXpzaWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MzIxODUsImV4cCI6MjA5MTMwODE4NX0.tV2gWuR6FJwwtpBb7k5IrIrSIppAAUYyRo1Z44gxHpM'
)

const DASHBOARD_URL = 'https://app.hoacommunityiq.com'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [mode, setMode]         = useState<'login' | 'reset'>('login')
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    window.location.href = DASHBOARD_URL
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: DASHBOARD_URL,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setResetSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F4F9F6] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1A5C38] flex items-center justify-center">
            <span className="text-white font-bold text-sm">IQ</span>
          </div>
          <span className="font-bold text-lg text-[#1A5C38]">CommunityIQ</span>
        </a>
      </nav>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === 'login' ? 'Board Member Login' : 'Reset Password'}
            </h1>
            <p className="text-gray-500 text-sm">
              {mode === 'login' ? 'Sign in to access your HOA dashboard' : 'Enter your email and we\'ll send a reset link'}
            </p>
          </div>

          {resetSent ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-[#EAF3DE] flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
              <h3 className="font-semibold text-gray-900 mb-2">Check your email</h3>
              <p className="text-sm text-gray-500 mb-6">We sent a password reset link to <strong>{email}</strong></p>
              <button onClick={() => { setMode('login'); setResetSent(false) }} className="text-sm text-[#1A5C38] font-medium hover:underline">
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={mode === 'login' ? handleLogin : handleReset} className="bg-white rounded-2xl border border-gray-200 p-8 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@yourhoa.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
                />
              </div>

              {mode === 'login' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
                    <button type="button" onClick={() => { setMode('reset'); setError('') }} className="text-xs text-[#1A5C38] font-medium hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A5C38] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#154d30] transition-colors disabled:opacity-60"
              >
                {loading ? '…' : mode === 'login' ? 'Sign In' : 'Send Reset Link'}
              </button>

              {mode === 'reset' && (
                <button type="button" onClick={() => { setMode('login'); setError('') }} className="w-full text-center text-sm text-gray-400 hover:text-gray-600">
                  Back to sign in
                </button>
              )}
            </form>
          )}

          <p className="text-center text-sm text-gray-400 mt-6">
            Not a board member?{' '}
            <a href="/#contact" className="text-[#1A5C38] font-medium hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  )
}
