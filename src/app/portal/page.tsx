'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://sdcvfxontkwfvcezsilm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkY3ZmeG9udGt3ZnZjZXpzaWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MzIxODUsImV4cCI6MjA5MTMwODE4NX0.tV2gWuR6FJwwtpBb7k5IrIrSIppAAUYyRo1Z44gxHpM'
)

const CATEGORIES = [
  { key: 'common_area', label: 'Common Area' },
  { key: 'roads',       label: 'Roads & Parking' },
  { key: 'lighting',    label: 'Lighting' },
  { key: 'landscaping', label: 'Landscaping' },
  { key: 'pool',        label: 'Pool & Amenities' },
  { key: 'amenities',   label: 'Amenities' },
  { key: 'other',       label: 'Other' },
]

const STATUS_LABELS = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' }
const STATUS_COLORS = { open: '#A32D2D', in_progress: '#B45309', resolved: '#166534', closed: '#888' }
const STATUS_BG     = { open: '#FCEBEB', in_progress: '#FFF8E7', resolved: '#EAF3DE', closed: '#f0f0f0' }

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const fmtDateShort = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

type Resident = { id: string; full_name: string; hoa_id: string; address: string; role: string }
type Hoa      = { id: string; name: string }

export default function PortalPage() {
  const [resident, setResident] = useState<Resident | null>(null)
  const [hoa, setHoa]           = useState<Hoa | null>(null)
  const [tab, setTab]           = useState('home')
  const [loading, setLoading]   = useState(true)

  // Home tab data
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [events, setEvents]               = useState<any[]>([])

  // Maintenance tab data
  const [myRequests, setMyRequests]   = useState<any[]>([])
  const [showNewForm, setShowNewForm] = useState(false)
  const [category, setCategory]       = useState('other')
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress]         = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/portal/login'; return }
      const { data: res } = await supabase.from('residents').select('*').eq('id', session.user.id).single()
      if (!res) { window.location.href = '/portal/login'; return }
      setResident(res)
      const { data: hoaData } = await supabase.from('hoas').select('*').eq('id', res.hoa_id).single()
      if (hoaData) setHoa(hoaData)
      await Promise.all([
        loadAnnouncements(res.hoa_id),
        loadEvents(res.hoa_id),
        loadMyRequests(session.user.id, res.hoa_id),
      ])
      setLoading(false)
    })
  }, [])

  const loadAnnouncements = async (hoaId: string) => {
    const { data } = await supabase.from('announcements').select('*').eq('hoa_id', hoaId)
      .order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(5)
    setAnnouncements(data || [])
  }

  const loadEvents = async (hoaId: string) => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('events').select('*').eq('hoa_id', hoaId)
      .gte('event_date', today).order('event_date').limit(5)
    setEvents(data || [])
  }

  const loadMyRequests = async (userId: string, hoaId: string) => {
    const { data } = await supabase.from('maintenance_requests').select('*')
      .eq('hoa_id', hoaId).eq('resident_id', userId).order('created_at', { ascending: false })
    setMyRequests(data || [])
  }

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !resident) return
    setSubmitting(true)
    await supabase.from('maintenance_requests').insert([{
      hoa_id: resident.hoa_id,
      resident_id: resident.id,
      resident_name: resident.full_name,
      address: address.trim() || resident.address,
      category,
      title: title.trim(),
      description: description.trim(),
      status: 'open',
      priority: 'normal',
    }])
    setTitle(''); setDescription(''); setAddress(''); setCategory('other')
    setSubmitting(false)
    setSubmitSuccess(true)
    await loadMyRequests(resident.id, resident.hoa_id)
    setTimeout(() => { setSubmitSuccess(false); setShowNewForm(false) }, 2500)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/portal/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F9F6] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F9F6]">
      {/* Header */}
      <header className="bg-[#1A5C38] px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-xs">IQ</span>
              </div>
              <span className="text-white/70 text-sm">{hoa?.name || 'My Community'}</span>
            </div>
            <h1 className="text-white font-bold text-xl">Hi, {resident?.full_name?.split(' ')[0]} 👋</h1>
          </div>
          <button onClick={handleSignOut} className="text-white/60 text-sm hover:text-white transition-colors">
            Sign out
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex">
          {[
            { key: 'home',        label: 'Home' },
            { key: 'maintenance', label: 'Maintenance' },
            { key: 'announcements', label: 'Announcements' },
            { key: 'events',      label: 'Events' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-[#1A5C38] text-[#1A5C38]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              {t.key === 'maintenance' && myRequests.filter(r => r.status === 'open' || r.status === 'in_progress').length > 0 && (
                <span className="ml-1.5 bg-[#EAF3DE] text-[#1A5C38] text-xs font-bold px-2 py-0.5 rounded-full">
                  {myRequests.filter(r => r.status === 'open' || r.status === 'in_progress').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* HOME TAB */}
        {tab === 'home' && (
          <div className="space-y-6">
            {/* Quick actions */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ActionCard icon="🔧" label="Maintenance Request" onClick={() => { setTab('maintenance'); setShowNewForm(true) }} />
                <ActionCard icon="📋" label="ARC Request" href="mailto:board@yourhoa.com?subject=ARC Request" />
                <ActionCard icon="📅" label="Book Amenity" onClick={() => setTab('events')} />
              </div>
            </div>

            {/* Latest announcements */}
            {announcements.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Latest Announcements</h2>
                  <button onClick={() => setTab('announcements')} className="text-xs text-[#1A5C38] font-medium hover:underline">View all →</button>
                </div>
                <div className="space-y-3">
                  {announcements.slice(0, 2).map(a => (
                    <div key={a.id} className={`bg-white rounded-2xl border p-5 ${a.pinned ? 'border-[#1A5C38]/30' : 'border-gray-100'}`}>
                      {a.pinned && <span className="text-xs font-bold text-[#1A5C38] bg-[#EAF3DE] px-2 py-0.5 rounded-full mr-2">📌 Pinned</span>}
                      <h3 className="font-semibold text-gray-900 mt-1 mb-1">{a.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{a.body}</p>
                      <p className="text-xs text-gray-400 mt-2">{fmtDate(a.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming events */}
            {events.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Upcoming Events</h2>
                  <button onClick={() => setTab('events')} className="text-xs text-[#1A5C38] font-medium hover:underline">View all →</button>
                </div>
                <div className="space-y-2">
                  {events.slice(0, 3).map(e => (
                    <div key={e.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4">
                      <div className="text-center min-w-[40px]">
                        <div className="text-lg font-bold text-[#1A5C38]">{new Date(e.event_date + 'T12:00:00').getDate()}</div>
                        <div className="text-xs text-gray-400 uppercase">{new Date(e.event_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{e.title}</div>
                        {e.location && <div className="text-xs text-gray-400">📍 {e.location}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My open requests */}
            {myRequests.filter(r => r.status === 'open' || r.status === 'in_progress').length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">My Open Requests</h2>
                  <button onClick={() => setTab('maintenance')} className="text-xs text-[#1A5C38] font-medium hover:underline">View all →</button>
                </div>
                <div className="space-y-2">
                  {myRequests.filter(r => r.status === 'open' || r.status === 'in_progress').slice(0, 3).map(r => (
                    <RequestRow key={r.id} r={r} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MAINTENANCE TAB */}
        {tab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Maintenance Requests</h2>
              {!showNewForm && (
                <button
                  onClick={() => setShowNewForm(true)}
                  className="bg-[#1A5C38] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#154d30] transition-colors"
                >
                  + New Request
                </button>
              )}
            </div>

            {submitSuccess && (
              <div className="bg-[#EAF3DE] border border-[#1A5C38]/20 rounded-xl px-5 py-4 text-sm text-[#1A5C38] font-medium">
                ✓ Request submitted! The board will review it shortly.
              </div>
            )}

            {showNewForm && !submitSuccess && (
              <form onSubmit={submitRequest} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">New Maintenance Request</h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button key={c.key} type="button"
                        onClick={() => setCategory(c.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          category === c.key
                            ? 'bg-[#1A5C38] text-white border-[#1A5C38]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A5C38]'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Title *</label>
                  <input
                    type="text" required value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Brief description of the issue"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Details</label>
                  <textarea
                    value={description} onChange={e => setDescription(e.target.value)} rows={3}
                    placeholder="More details about the problem…"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Location / Address</label>
                  <input
                    type="text" value={address} onChange={e => setAddress(e.target.value)}
                    placeholder={resident?.address || 'Where is this issue?'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit" disabled={submitting}
                    className="flex-1 bg-[#1A5C38] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#154d30] transition-colors disabled:opacity-60"
                  >
                    {submitting ? 'Submitting…' : 'Submit Request'}
                  </button>
                  <button type="button" onClick={() => setShowNewForm(false)}
                    className="px-5 py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {myRequests.length === 0 && !showNewForm ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500 text-sm mb-4">No requests yet.</p>
                <button onClick={() => setShowNewForm(true)} className="bg-[#1A5C38] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#154d30] transition-colors">
                  Submit Your First Request
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{r.title}</h3>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ background: STATUS_BG[r.status as keyof typeof STATUS_BG] || '#f0f0f0', color: STATUS_COLORS[r.status as keyof typeof STATUS_COLORS] || '#888' }}>
                        {STATUS_LABELS[r.status as keyof typeof STATUS_LABELS] || r.status}
                      </span>
                    </div>
                    {r.description && <p className="text-sm text-gray-500 mb-2">{r.description}</p>}
                    <p className="text-xs text-gray-400">Submitted {fmtDate(r.created_at)}</p>
                    {r.board_notes && (
                      <div className="mt-3 bg-[#EAF3DE] rounded-xl px-4 py-3">
                        <p className="text-xs font-bold text-[#1A5C38] mb-1">Board Note</p>
                        <p className="text-sm text-gray-700">{r.board_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {tab === 'announcements' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Announcements</h2>
            {announcements.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No announcements yet.</div>
            )}
            {announcements.map(a => (
              <div key={a.id} className={`bg-white rounded-2xl border p-6 ${a.pinned ? 'border-[#1A5C38]/30' : 'border-gray-100'}`}>
                {a.pinned && <span className="inline-block text-xs font-bold text-[#1A5C38] bg-[#EAF3DE] px-2 py-0.5 rounded-full mb-2">📌 Pinned</span>}
                <h3 className="font-bold text-gray-900 mb-2">{a.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{a.body}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  {a.created_by && <span>{a.created_by} ·</span>}
                  <span>{fmtDate(a.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EVENTS TAB */}
        {tab === 'events' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Upcoming Events</h2>
            {events.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No upcoming events.</div>
            )}
            {events.map(e => (
              <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5">
                <div className="text-center min-w-[52px] bg-[#EAF3DE] rounded-xl px-2 py-3">
                  <div className="text-xl font-bold text-[#1A5C38]">{new Date(e.event_date + 'T12:00:00').getDate()}</div>
                  <div className="text-xs text-[#1A5C38] uppercase font-semibold">{new Date(e.event_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{e.title}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-2">
                    {e.location && <span>📍 {e.location}</span>}
                    {e.start_time && <span>🕐 {e.start_time.slice(0, 5)}{e.end_time ? ` – ${e.end_time.slice(0, 5)}` : ''}</span>}
                    {e.event_type && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{e.event_type}</span>}
                  </div>
                  {e.description && <p className="text-sm text-gray-500">{e.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function ActionCard({ icon, label, onClick, href }: { icon: string; label: string; onClick?: () => void; href?: string }) {
  const cls = "bg-white rounded-2xl border border-gray-100 p-5 text-center hover:border-[#1A5C38] hover:shadow-sm transition-all cursor-pointer group"
  if (href) return (
    <a href={href} className={cls}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm font-medium text-gray-700 group-hover:text-[#1A5C38]">{label}</div>
    </a>
  )
  return (
    <button onClick={onClick} className={cls}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm font-medium text-gray-700 group-hover:text-[#1A5C38]">{label}</div>
    </button>
  )
}

function RequestRow({ r }: { r: any }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-gray-900">{r.title}</div>
        <div className="text-xs text-gray-400 mt-0.5">{fmtDateShort(r.created_at)}</div>
      </div>
      <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
        style={{ background: STATUS_BG[r.status as keyof typeof STATUS_BG] || '#f0f0f0', color: STATUS_COLORS[r.status as keyof typeof STATUS_COLORS] || '#888' }}>
        {STATUS_LABELS[r.status as keyof typeof STATUS_LABELS] || r.status}
      </span>
    </div>
  )
}
