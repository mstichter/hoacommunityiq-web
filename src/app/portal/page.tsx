'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import ViolationsSection  from './components/ViolationsSection'
import ARCSection         from './components/ARCSection'
import BookingsSection    from './components/BookingsSection'
import PoolSection        from './components/PoolSection'
import DocumentsSection   from './components/DocumentsSection'
import NewsletterSection  from './components/NewsletterSection'
import MinutesSection     from './components/MinutesSection'
import RulesSection          from './components/RulesSection'
import ProfileSection        from './components/ProfileSection'
import ContactBoardSection   from './components/ContactBoardSection'

const CATEGORIES_MAINT = [
  { key:'common_area',label:'Common Area'},{ key:'roads',label:'Roads & Parking'},
  { key:'lighting',label:'Lighting'},{ key:'landscaping',label:'Landscaping'},
  { key:'pool',label:'Pool & Amenities'},{ key:'amenities',label:'Amenities'},{ key:'other',label:'Other'},
]
const STATUS_LABELS: Record<string,string> = {open:'Open',in_progress:'In Progress',resolved:'Resolved',closed:'Closed'}
const STATUS_COLORS: Record<string,string> = {open:'#A32D2D',in_progress:'#B45309',resolved:'#166534',closed:'#888'}
const STATUS_BG: Record<string,string>     = {open:'#FCEBEB',in_progress:'#FFF8E7',resolved:'#EAF3DE',closed:'#f0f0f0'}
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})

const NAV = [
  { key:'home',        label:'Home',              icon:'🏠', group:'main' },
  { key:'announcements',label:'Announcements',    icon:'📣', group:'community' },
  { key:'events',      label:'Events',            icon:'📅', group:'community' },
  { key:'pool',        label:'Pool Status',       icon:'🏊', group:'community' },
  { key:'newsletter',  label:'Newsletter',        icon:'📰', group:'community' },
  { key:'minutes',     label:'Meeting Minutes',   icon:'📝', group:'community' },
  { key:'documents',   label:'Documents',         icon:'📂', group:'community' },
  { key:'maintenance', label:'Maintenance',       icon:'🔧', group:'requests' },
  { key:'violations',  label:'Report Violation',  icon:'🚨', group:'requests' },
  { key:'arc',         label:'ARC Request',       icon:'🏗️', group:'requests' },
  { key:'bookings',    label:'Book Amenity',      icon:'🗓️', group:'requests' },
  { key:'rules',       label:'Rules Assistant',   icon:'📋', group:'tools' },
  { key:'contact',     label:'Ask the Board',     icon:'💬', group:'tools' },
  { key:'profile',     label:'My Profile',        icon:'👤', group:'tools' },
]

const GROUP_LABELS: Record<string,string> = { community:'Community', requests:'Submit a Request', tools:'Tools' }

export default function PortalPage() {
  const [resident, setResident]   = useState<any>(null)
  const [hoa, setHoa]             = useState<any>(null)
  const [section, setSection]     = useState('home')
  const [loading, setLoading]     = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [prefillQuestion, setPrefillQuestion] = useState('')

  // Home tab state
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [events, setEvents]               = useState<any[]>([])
  const [myRequests, setMyRequests]       = useState<any[]>([])

  // Maintenance state
  const [showNewMaint, setShowNewMaint]   = useState(false)
  const [category, setCategory]           = useState('other')
  const [title, setTitle]                 = useState('')
  const [description, setDescription]     = useState('')
  const [address, setAddress]             = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [maintSuccess, setMaintSuccess]   = useState(false)

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
      .order('pinned',{ascending:false}).order('created_at',{ascending:false}).limit(10)
    setAnnouncements(data || [])
  }
  const loadEvents = async (hoaId: string) => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('events').select('*').eq('hoa_id', hoaId)
      .gte('event_date', today).order('event_date').limit(10)
    setEvents(data || [])
  }
  const loadMyRequests = async (userId: string, hoaId: string) => {
    const { data } = await supabase.from('maintenance_requests').select('*')
      .eq('hoa_id', hoaId).eq('resident_id', userId).order('created_at',{ascending:false})
    setMyRequests(data || [])
  }

  const submitMaint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !resident) return
    setSubmitting(true)
    await supabase.from('maintenance_requests').insert([{
      hoa_id: resident.hoa_id, resident_id: resident.id,
      resident_name: resident.full_name, address: address.trim() || resident.address,
      category, title: title.trim(), description: description.trim(), status:'open', priority:'normal',
    }])
    setTitle(''); setDescription(''); setAddress(''); setCategory('other')
    setSubmitting(false); setMaintSuccess(true)
    await loadMyRequests(resident.id, resident.hoa_id)
    setTimeout(() => { setMaintSuccess(false); setShowNewMaint(false) }, 2500)
  }

  const handleSignOut = async () => { await supabase.auth.signOut(); window.location.href = '/portal/login' }

  const navigate = (key: string) => { setSection(key); setSidebarOpen(false) }
  const askBoard = (question: string) => { setPrefillQuestion(question); setSection('contact'); setSidebarOpen(false) }

  if (loading) return (
    <div className="min-h-screen bg-[#F4F9F6] flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading…</div>
    </div>
  )

  const openRequests = myRequests.filter(r => r.status === 'open' || r.status === 'in_progress').length
  const currentNav   = NAV.find(n => n.key === section)

  return (
    <div className="min-h-screen bg-[#F4F9F6] flex flex-col">
      {/* Top bar */}
      <header className="bg-[#1A5C38] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-white/70 hover:text-white p-1">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-xs">IQ</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-sm">{hoa?.name || 'My Community'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('profile')} className="text-white/80 text-sm hover:text-white transition-colors hidden sm:block">{resident?.full_name}</button>
          <button onClick={handleSignOut} className="text-white/60 text-sm hover:text-white transition-colors">Sign out</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 w-60 bg-white border-r border-gray-100 flex-shrink-0 overflow-y-auto
          transform transition-transform lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `} style={{ top: 0, paddingTop: sidebarOpen ? 0 : 0 }}>
          <div className="p-4 pt-6">
            {/* main items */}
            {NAV.filter(n => n.group === 'main').map(n => (
              <SidebarItem key={n.key} item={n} active={section===n.key} onClick={() => navigate(n.key)}
                badge={n.key==='maintenance' ? openRequests : 0} />
            ))}

            {(['community','requests','tools'] as const).map(group => (
              <div key={group} className="mt-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 mb-1">{GROUP_LABELS[group]}</p>
                {NAV.filter(n => n.group === group).map(n => (
                  <SidebarItem key={n.key} item={n} active={section===n.key} onClick={() => navigate(n.key)}
                    badge={n.key==='maintenance' ? openRequests : 0} />
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* HOME */}
          {section === 'home' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {resident?.full_name?.split(' ')[0]}!</h1>
                <p className="text-gray-500 text-sm mt-1">{hoa?.name}</p>
              </div>

              {/* Quick actions */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Actions</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon:'🔧', label:'Maintenance',     key:'maintenance' },
                    { icon:'🚨', label:'Report Violation', key:'violations' },
                    { icon:'🏗️', label:'ARC Request',     key:'arc' },
                    { icon:'🗓️', label:'Book Amenity',    key:'bookings' },
                  ].map(a => (
                    <button key={a.key} onClick={() => navigate(a.key)}
                      className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:border-[#1A5C38] hover:shadow-sm transition-all group">
                      <div className="text-2xl mb-2">{a.icon}</div>
                      <div className="text-xs font-medium text-gray-600 group-hover:text-[#1A5C38]">{a.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Latest announcements */}
              {announcements.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Announcements</p>
                    <button onClick={() => navigate('announcements')} className="text-xs text-[#1A5C38] font-medium hover:underline">View all →</button>
                  </div>
                  <div className="space-y-3">
                    {announcements.slice(0,2).map(a => (
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
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Upcoming Events</p>
                    <button onClick={() => navigate('events')} className="text-xs text-[#1A5C38] font-medium hover:underline">View all →</button>
                  </div>
                  <div className="space-y-2">
                    {events.slice(0,3).map(e => (
                      <div key={e.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4">
                        <div className="text-center min-w-[40px] bg-[#EAF3DE] rounded-xl py-1.5">
                          <div className="text-base font-bold text-[#1A5C38]">{new Date(e.event_date+'T12:00:00').getDate()}</div>
                          <div className="text-xs text-[#1A5C38] uppercase">{new Date(e.event_date+'T12:00:00').toLocaleDateString('en-US',{month:'short'})}</div>
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
              {openRequests > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">My Open Requests</p>
                    <button onClick={() => navigate('maintenance')} className="text-xs text-[#1A5C38] font-medium hover:underline">View all →</button>
                  </div>
                  <div className="space-y-2">
                    {myRequests.filter(r=>r.status==='open'||r.status==='in_progress').slice(0,3).map(r => (
                      <div key={r.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{r.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{fmtDate(r.created_at)}</div>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                          style={{background:STATUS_BG[r.status]||'#f0f0f0',color:STATUS_COLORS[r.status]||'#888'}}>
                          {STATUS_LABELS[r.status]||r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ANNOUNCEMENTS */}
          {section === 'announcements' && (
            <div className="max-w-2xl space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
              {announcements.length === 0 && <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No announcements yet.</div>}
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

          {/* EVENTS */}
          {section === 'events' && (
            <div className="max-w-2xl space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
              {events.length === 0 && <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No upcoming events.</div>}
              {events.map(e => (
                <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5">
                  <div className="text-center min-w-[52px] bg-[#EAF3DE] rounded-xl px-2 py-3">
                    <div className="text-xl font-bold text-[#1A5C38]">{new Date(e.event_date+'T12:00:00').getDate()}</div>
                    <div className="text-xs text-[#1A5C38] uppercase font-semibold">{new Date(e.event_date+'T12:00:00').toLocaleDateString('en-US',{month:'short'})}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{e.title}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-2">
                      {e.location && <span>📍 {e.location}</span>}
                      {e.start_time && <span>🕐 {e.start_time.slice(0,5)}{e.end_time ? ` – ${e.end_time.slice(0,5)}` : ''}</span>}
                      {e.event_type && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{e.event_type}</span>}
                    </div>
                    {e.description && <p className="text-sm text-gray-500">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MAINTENANCE */}
          {section === 'maintenance' && (
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Maintenance Requests</h2>
                  <p className="text-gray-500 text-sm">Submit and track repair requests</p>
                </div>
                {!showNewMaint && (
                  <button onClick={() => setShowNewMaint(true)}
                    className="bg-[#1A5C38] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#154d30] transition-colors">
                    + New Request
                  </button>
                )}
              </div>

              {maintSuccess && <div className="bg-[#EAF3DE] border border-[#1A5C38]/20 rounded-xl px-5 py-4 text-sm text-[#1A5C38] font-medium mb-4">✓ Request submitted! The board will review it shortly.</div>}

              {showNewMaint && !maintSuccess && (
                <form onSubmit={submitMaint} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 mb-6">
                  <h3 className="font-semibold text-gray-900">New Maintenance Request</h3>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES_MAINT.map(c => (
                        <button key={c.key} type="button" onClick={() => setCategory(c.key)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${category===c.key ? 'bg-[#1A5C38] text-white border-[#1A5C38]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A5C38]'}`}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Title *</label>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief description of the issue"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Details</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="More details…"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Location / Address</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder={resident?.address || 'Where is this issue?'}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={submitting}
                      className="flex-1 bg-[#1A5C38] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#154d30] transition-colors disabled:opacity-60">
                      {submitting ? 'Submitting…' : 'Submit Request'}
                    </button>
                    <button type="button" onClick={() => setShowNewMaint(false)}
                      className="px-5 py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
                  </div>
                </form>
              )}

              {myRequests.length === 0 && !showNewMaint ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <p className="text-gray-500 text-sm mb-4">No requests yet.</p>
                  <button onClick={() => setShowNewMaint(true)} className="bg-[#1A5C38] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#154d30] transition-colors">Submit Your First Request</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRequests.map(r => (
                    <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{r.title}</h3>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                          style={{background:STATUS_BG[r.status]||'#f0f0f0',color:STATUS_COLORS[r.status]||'#888'}}>
                          {STATUS_LABELS[r.status]||r.status}
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

          {/* Delegated sections */}
          {section === 'violations'  && <ViolationsSection  resident={resident} />}
          {section === 'arc'         && <ARCSection         resident={resident} />}
          {section === 'bookings'    && <BookingsSection    resident={resident} />}
          {section === 'pool'        && <PoolSection        resident={resident} />}
          {section === 'documents'   && <DocumentsSection   resident={resident} />}
          {section === 'newsletter'  && <NewsletterSection  resident={resident} />}
          {section === 'minutes'     && <MinutesSection     resident={resident} />}
          {section === 'rules'       && <RulesSection       resident={resident} onAskBoard={askBoard} />}
          {section === 'contact'     && <ContactBoardSection resident={resident} prefill={prefillQuestion} />}
          {section === 'profile'    && <ProfileSection     resident={resident} onUpdate={setResident} />}
        </main>
      </div>
    </div>
  )
}

function SidebarItem({ item, active, onClick, badge }: { item: any; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors mb-0.5 ${active ? 'bg-[#EAF3DE] text-[#1A5C38]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
      <span className="text-base">{item.icon}</span>
      <span className="flex-1 text-left">{item.label}</span>
      {badge && badge > 0 && (
        <span className="bg-[#1A5C38] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{badge}</span>
      )}
    </button>
  )
}
