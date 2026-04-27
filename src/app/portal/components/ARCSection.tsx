'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const PROJECT_TYPES = ['Fence','Deck/Patio','Paint','Roof','Landscaping','Addition','Driveway','Shed','Solar Panels','Other']
const STATUS_LABELS: Record<string,string> = { pending:'Pending', under_review:'Under Review', approved:'Approved', denied:'Denied', more_info:'More Info Needed' }
const STATUS_COLORS: Record<string,string> = { pending:'#B45309', under_review:'#1D4ED8', approved:'#166534', denied:'#A32D2D', more_info:'#7C3AED' }
const STATUS_BG: Record<string,string>     = { pending:'#FFF8E7', under_review:'#EEF4FF', approved:'#EAF3DE', denied:'#FCEBEB', more_info:'#F5F3FF' }

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const today = () => new Date().toISOString().split('T')[0]
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0] }

export default function ARCSection({ resident }: { resident: any }) {
  const [view, setView]                 = useState<'list'|'new'>('list')
  const [submissions, setSubmissions]   = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [projectType, setProjectType]   = useState('')
  const [description, setDescription]   = useState('')
  const [startDate, setStartDate]       = useState('')
  const [endDate, setEndDate]           = useState('')
  const [contractor, setContractor]     = useState('')
  const [photos, setPhotos]             = useState<FileList | null>(null)
  const [submitting, setSubmitting]     = useState(false)
  const [success, setSuccess]           = useState(false)
  const [error, setError]               = useState('')

  useEffect(() => { fetchSubmissions() }, [])

  const fetchSubmissions = async () => {
    const { data } = await supabase.from('arc_submissions').select('*')
      .eq('hoa_id', resident.hoa_id).eq('resident_id', resident.id)
      .order('submitted_at', { ascending: false })
    setSubmissions(data || [])
    setLoading(false)
  }

  const uploadPhotos = async (): Promise<string[]> => {
    if (!photos || photos.length === 0) return []
    const urls: string[] = []
    for (let i = 0; i < Math.min(photos.length, 5); i++) {
      const f    = photos[i]
      const ext  = f.name.split('.').pop()
      const path = `arc/${Date.now()}-${i}.${ext}`
      const { error } = await supabase.storage.from('documents').upload(path, f)
      if (!error) urls.push(supabase.storage.from('documents').getPublicUrl(path).data.publicUrl)
    }
    return urls
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectType) { setError('Please select a project type.'); return }
    setError('')
    setSubmitting(true)
    const photoUrls = await uploadPhotos()
    await supabase.from('arc_submissions').insert([{
      hoa_id:          resident.hoa_id,
      resident_id:     resident.id,
      resident_name:   resident.full_name,
      resident_address: resident.address,
      project_type:    projectType,
      description:     description.trim(),
      start_date:      startDate || null,
      end_date:        endDate   || null,
      contractor_name: contractor.trim() || null,
      photos:          photoUrls,
      status:          'pending',
      submitted_at:    new Date().toISOString(),
    }])
    setSubmitting(false)
    setSuccess(true)
    fetchSubmissions()
    setTimeout(() => { setSuccess(false); setView('list'); setProjectType(''); setDescription(''); setStartDate(''); setEndDate(''); setContractor(''); setPhotos(null) }, 3000)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">ARC Requests</h2>
          <p className="text-gray-500 text-sm">Architectural Review Committee submissions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('list')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view==='list' ? 'bg-[#1A5C38] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>My Requests</button>
          <button onClick={() => setView('new')}  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view==='new'  ? 'bg-[#1A5C38] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>New Request</button>
        </div>
      </div>

      {view === 'list' && (
        loading ? <div className="text-gray-400 text-sm">Loading…</div> : (
          submissions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-sm mb-4">No submissions yet.</p>
              <button onClick={() => setView('new')} className="bg-[#1A5C38] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#154d30] transition-colors">Submit a Request</button>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{s.project_type}</h3>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: STATUS_BG[s.status]||'#f0f0f0', color: STATUS_COLORS[s.status]||'#888' }}>
                      {STATUS_LABELS[s.status]||s.status}
                    </span>
                  </div>
                  {s.description && <p className="text-sm text-gray-500 mb-2">{s.description}</p>}
                  <p className="text-xs text-gray-400">Submitted {fmtDate(s.submitted_at)}</p>
                  {s.board_notes && (
                    <div className="mt-3 bg-[#EAF3DE] rounded-xl px-4 py-3">
                      <p className="text-xs font-bold text-[#1A5C38] mb-1">Board Note</p>
                      <p className="text-sm text-gray-700">{s.board_notes}</p>
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
          {success && <div className="bg-[#EAF3DE] border border-[#1A5C38]/20 rounded-xl px-5 py-4 text-sm text-[#1A5C38] font-medium">✓ Request submitted! The ARC committee will review it shortly.</div>}

          <a href="https://sdcvfxontkwfvcezsilm.supabase.co/storage/v1/object/public/documents/pdfs/ARC_Form.pdf"
            target="_blank" rel="noreferrer"
            className="flex items-center gap-3 bg-[#EEF4FF] border border-blue-200 rounded-xl px-4 py-3 hover:bg-blue-50 transition-colors">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#1D4ED8]">Download ARC Request Form</div>
              <div className="text-xs text-gray-500">Printable PDF version</div>
            </div>
            <span className="text-[#1D4ED8] font-bold">↓</span>
          </a>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Project Type *</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setProjectType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${projectType===t ? 'bg-[#1A5C38] text-white border-[#1A5C38]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A5C38]'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Describe the project in detail…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Est. Start Date</label>
              <input type="date" value={startDate} min={tomorrow()} onChange={e => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Est. End Date</label>
              <input type="date" value={endDate} min={startDate || tomorrow()} onChange={e => setEndDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Contractor Name (optional)</label>
            <input type="text" value={contractor} onChange={e => setContractor(e.target.value)}
              placeholder="ABC Contractors LLC"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Photos (up to 5)</label>
            <input type="file" accept="image/*" multiple onChange={e => setPhotos(e.target.files)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#EAF3DE] file:text-[#1A5C38]" />
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="flex-1 bg-[#1A5C38] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#154d30] transition-colors disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
            <button type="button" onClick={() => setView('list')} className="px-5 py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
