'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://sdcvfxontkwfvcezsilm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkY3ZmeG9udGt3ZnZjZXpzaWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MzIxODUsImV4cCI6MjA5MTMwODE4NX0.tV2gWuR6FJwwtpBb7k5IrIrSIppAAUYyRo1Z44gxHpM'
)

export default function PortalSignupPage() {
  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [address, setAddress]     = useState('')
  const [hoaQuery, setHoaQuery]   = useState('')
  const [hoaResults, setHoaResults] = useState<{id: string, name: string}[]>([])
  const [selectedHoa, setSelectedHoa] = useState<{id: string, name: string} | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState('')
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!hoaQuery.trim() || selectedHoa) { setHoaResults([]); return }
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(async () => {
      const { data } = await supabase
        .from('hoas')
        .select('id, name')
        .ilike('name', `%${hoaQuery}%`)
        .limit(6)
      setHoaResults(data || [])
    }, 300)
  }, [hoaQuery, selectedHoa])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHoa) { setError('Please search for and select your community.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/portal-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, address, hoaId: selectedHoa.id }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Something went wrong.'); setSubmitting(false); return }
    setSubmitted(true)
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F4F9F6] flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#EAF3DE] flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re in!</h2>
            <p className="text-gray-500 mb-8">Your account has been created for <strong>{selectedHoa?.name}</strong>.</p>
            <a href="/portal/login" className="block bg-[#1A5C38] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#154d30] transition-colors text-center">
              Sign In to Your Portal →
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F9F6] flex flex-col">
      <Nav />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-500">Access your community from anywhere</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 space-y-5">
            {/* HOA search */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Community *</label>
              {selectedHoa ? (
                <div className="flex items-center justify-between border border-[#1A5C38] rounded-xl px-4 py-3 bg-[#EAF3DE]">
                  <span className="text-sm font-medium text-[#1A5C38]">{selectedHoa.name}</span>
                  <button type="button" onClick={() => { setSelectedHoa(null); setHoaQuery('') }} className="text-xs text-gray-400 hover:text-gray-600">Change</button>
                </div>
              ) : (
                <>
                  <input
                    type="text" value={hoaQuery} onChange={e => setHoaQuery(e.target.value)}
                    placeholder="Search for your HOA or community name…"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
                  />
                  {hoaResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {hoaResults.map(h => (
                        <button key={h.id} type="button"
                          onClick={() => { setSelectedHoa(h); setHoaQuery(h.name); setHoaResults([]) }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-[#EAF3DE] hover:text-[#1A5C38] transition-colors border-b border-gray-50 last:border-0"
                        >
                          {h.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {hoaQuery.length > 2 && hoaResults.length === 0 && (
                    <p className="mt-2 text-xs text-gray-400">No communities found. Ask your board for help signing up.</p>
                  )}
                </>
              )}
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Full Name *</label>
              <input
                type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email *</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="jane@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Home Address</label>
              <input
                type="text" value={address} onChange={e => setAddress(e.target.value)}
                placeholder="123 Oak Street"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Password *</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
              />
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

            <button
              type="submit" disabled={submitting}
              className="w-full bg-[#1A5C38] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#154d30] transition-colors disabled:opacity-60"
            >
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Already have an account?{' '}
              <a href="/portal/login" className="text-[#1A5C38] font-medium hover:underline">Sign in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

function Nav() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
      <a href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#1A5C38] flex items-center justify-center">
          <span className="text-white font-bold text-sm">IQ</span>
        </div>
        <span className="font-bold text-lg text-[#1A5C38]">CommunityIQ</span>
      </a>
      <a href="/login" className="text-sm text-gray-400 hover:text-[#1A5C38]">Board login →</a>
    </nav>
  )
}
