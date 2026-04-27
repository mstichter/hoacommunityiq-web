'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const EVENT_TYPES = ['Private Party','Family Gathering','Birthday','Meeting','Community Event','Other']
const STATUS_LABELS: Record<string,string> = { pending:'Pending', approved:'Approved', denied:'Denied' }
const STATUS_COLORS: Record<string,string> = { pending:'#B45309', approved:'#166534', denied:'#A32D2D' }
const STATUS_BG: Record<string,string>     = { pending:'#FFF8E7', approved:'#EAF3DE', denied:'#FCEBEB' }

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

function timeOptions() {
  const opts = []
  for (let h = 7; h <= 22; h++) {
    for (const m of [0, 30]) {
      const hh = h.toString().padStart(2,'0')
      const mm = m.toString().padStart(2,'0')
      const label = h < 12 ? `${h}:${mm} AM` : h === 12 ? `12:${mm} PM` : `${h-12}:${mm} PM`
      opts.push({ value: `${hh}:${mm}`, label })
    }
  }
  return opts
}

const TIME_OPTIONS = timeOptions()
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0] }

export default function BookingsSection({ resident }: { resident: any }) {
  const [view, setView]               = useState<'list'|'new'>('list')
  const [amenities, setAmenities]     = useState<any[]>([])
  const [bookings, setBookings]       = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [amenityId, setAmenityId]     = useState('')
  const [eventDate, setEventDate]     = useState('')
  const [startTime, setStartTime]     = useState('10:00')
  const [endTime, setEndTime]         = useState('14:00')
  const [eventType, setEventType]     = useState('')
  const [residentName, setResidentName] = useState(resident.full_name || '')
  const [phone, setPhone]             = useState('')
  const [attendance, setAttendance]   = useState('')
  const [notes, setNotes]             = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [success, setSuccess]         = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    Promise.all([fetchAmenities(), fetchMyBookings()])
  }, [])

  const fetchAmenities = async () => {
    const { data } = await supabase.from('amenities').select('*').eq('hoa_id', resident.hoa_id).eq('is_active', true).order('name')
    setAmenities(data || [])
  }

  const fetchMyBookings = async () => {
    const { data } = await supabase.from('bookings').select('*, amenities(name)')
      .eq('hoa_id', resident.hoa_id).eq('resident_id', resident.id)
      .order('event_date', { ascending: false })
    setBookings(data || [])
    setLoading(false)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amenityId) { setError('Please select an amenity.'); return }
    if (!eventDate) { setError('Please select a date.'); return }
    if (!eventType) { setError('Please select an event type.'); return }
    setError('')
    setSubmitting(true)
    await supabase.from('bookings').insert([{
      hoa_id:       resident.hoa_id,
      resident_id:  resident.id,
      amenity_id:   amenityId,
      event_date:   eventDate,
      start_time:   startTime,
      end_time:     endTime,
      event_type:   eventType,
      resident_name: residentName,
      resident_address: resident.address,
      resident_phone: phone || null,
      expected_attendance: attendance ? parseInt(attendance) : null,
      special_requests: notes.trim() || null,
      status: 'pending',
    }])
    setSubmitting(false)
    setSuccess(true)
    fetchMyBookings()
    setTimeout(() => { setSuccess(false); setView('list'); setAmenityId(''); setEventDate(''); setEventType(''); setPhone(''); setAttendance(''); setNotes('') }, 3000)
  }

  const selectedAmenity = amenities.find(a => a.id === amenityId)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Amenity Bookings</h2>
          <p className="text-gray-500 text-sm">Reserve the clubhouse, pavilion, and more</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('list')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view==='list' ? 'bg-[#1A5C38] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>My Bookings</button>
          <button onClick={() => setView('new')}  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view==='new'  ? 'bg-[#1A5C38] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Book Now</button>
        </div>
      </div>

      {view === 'list' && (
        loading ? <div className="text-gray-400 text-sm">Loading…</div> : (
          bookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-sm mb-4">No bookings yet.</p>
              <button onClick={() => setView('new')} className="bg-[#1A5C38] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#154d30] transition-colors">Book an Amenity</button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900">{b.amenities?.name || 'Amenity'} — {b.event_type}</h3>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: STATUS_BG[b.status]||'#f0f0f0', color: STATUS_COLORS[b.status]||'#888' }}>
                      {STATUS_LABELS[b.status]||b.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{fmtDate(b.event_date)}{b.start_time ? ` · ${b.start_time.slice(0,5)} – ${b.end_time?.slice(0,5)}` : ''}</p>
                  {b.board_notes && (
                    <div className="mt-3 bg-[#EAF3DE] rounded-xl px-4 py-3">
                      <p className="text-xs font-bold text-[#1A5C38] mb-1">Board Note</p>
                      <p className="text-sm text-gray-700">{b.board_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )
      )}

      {view === 'new' && (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          {success && <div className="bg-[#EAF3DE] border border-[#1A5C38]/20 rounded-xl px-5 py-4 text-sm text-[#1A5C38] font-medium">✓ Booking request submitted! The board will confirm shortly.</div>}

          <a href="https://sdcvfxontkwfvcezsilm.supabase.co/storage/v1/object/public/documents/pdfs/Clubhouse_Rental_Form.pdf"
            target="_blank" rel="noreferrer"
            className="flex items-center gap-3 bg-[#EEF4FF] border border-blue-200 rounded-xl px-4 py-3 hover:bg-blue-50 transition-colors">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#1D4ED8]">Download Rental Form</div>
              <div className="text-xs text-gray-500">Printable PDF version</div>
            </div>
            <span className="text-[#1D4ED8] font-bold">↓</span>
          </a>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Amenity *</label>
            <div className="flex flex-wrap gap-2">
              {amenities.map(a => (
                <button key={a.id} type="button" onClick={() => setAmenityId(a.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${amenityId===a.id ? 'bg-[#1A5C38] text-white border-[#1A5C38]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A5C38]'}`}>
                  {a.name}
                </button>
              ))}
            </div>
            {selectedAmenity?.fee && <p className="mt-2 text-xs text-gray-500">Fee: ${selectedAmenity.fee}{selectedAmenity.deposit ? ` · Deposit: $${selectedAmenity.deposit}` : ''}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Date *</label>
              <input type="date" value={eventDate} min={tomorrow()} onChange={e => setEventDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Start</label>
              <select value={startTime} onChange={e => setStartTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors bg-white">
                {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">End</label>
              <select value={endTime} onChange={e => setEndTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors bg-white">
                {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Event Type *</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setEventType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${eventType===t ? 'bg-[#1A5C38] text-white border-[#1A5C38]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A5C38]'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Name *</label>
              <input type="text" required value={residentName} onChange={e => setResidentName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Expected Attendance</label>
            <input type="number" value={attendance} onChange={e => setAttendance(e.target.value)} min="1" placeholder="25"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Special Requests</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any special needs or notes…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors resize-none" />
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="flex-1 bg-[#1A5C38] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#154d30] transition-colors disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit Booking Request'}
            </button>
            <button type="button" onClick={() => setView('list')} className="px-5 py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
