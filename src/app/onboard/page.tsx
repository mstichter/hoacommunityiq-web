'use client'

import { useState } from 'react'

export default function OnboardPage() {
  const [hoaName, setHoaName]     = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [password, setPassword]   = useState('')
  const [homesCount, setHomesCount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hoaName, adminName, adminEmail, password, homesCount }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#F4F9F6] flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1A5C38] flex items-center justify-center">
            <span className="text-white font-bold text-sm">IQ</span>
          </div>
          <span className="font-bold text-lg text-[#1A5C38]">CommunityIQ</span>
        </a>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          {submitted ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#EAF3DE] flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
              <p className="text-gray-500 mb-2">Your dashboard for <strong>{hoaName}</strong> is ready.</p>
              <p className="text-gray-500 mb-8 text-sm">Check your email at <strong>{adminEmail}</strong> for login instructions.</p>
              <a href="https://app.hoacommunityiq.com" className="block bg-[#1A5C38] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#154d30] transition-colors text-center">
                Open Board Dashboard →
              </a>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Get started free</h1>
                <p className="text-gray-500">Set up your HOA in under 2 minutes</p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Community / HOA Name *</label>
                  <input
                    type="text"
                    required
                    value={hoaName}
                    onChange={e => setHoaName(e.target.value)}
                    placeholder="The Parks of Carolina Forest"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Number of Homes</label>
                  <select
                    value={homesCount}
                    onChange={e => setHomesCount(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors bg-white text-gray-700"
                  >
                    <option value="">Select range…</option>
                    <option>Under 50</option>
                    <option>50 – 150</option>
                    <option>150 – 500</option>
                    <option>500+</option>
                  </select>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="jane@yourhoa.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1A5C38] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#154d30] transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Setting up your dashboard…' : 'Create My Dashboard'}
                </button>

                <p className="text-center text-xs text-gray-400">
                  By signing up you agree to our terms. Already have an account?{' '}
                  <a href="/login" className="text-[#1A5C38] font-medium hover:underline">Sign in</a>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
