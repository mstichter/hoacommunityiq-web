'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const MEETING_TYPES = ['Regular Board','Special','Annual','Committee','Executive Session']
const fmtDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

export default function MinutesSection({ resident }: { resident: any }) {
  const [minutes, setMinutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    supabase.from('meeting_minutes').select('*').eq('hoa_id', resident.hoa_id)
      .order('meeting_date', { ascending: false })
      .then(({ data }) => { setMinutes(data || []); setLoading(false) })
  }, [])

  if (selected) return (
    <div className="max-w-2xl">
      <button onClick={() => setSelected(null)} className="text-[#1A5C38] text-sm font-medium hover:underline mb-4 block">← Back to Meeting Minutes</button>
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-xl font-bold text-gray-900">{selected.title}</h2>
        {selected.meeting_type && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EEF4FF] text-[#1D4ED8]">{selected.meeting_type}</span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-6">{selected.published_by && `${selected.published_by} · `}{selected.meeting_date && fmtDate(selected.meeting_date)}</p>

      {selected.pdf_url ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-500 text-sm mb-4">Minutes are available as a PDF.</p>
          <a href={selected.pdf_url} target="_blank" rel="noreferrer"
            className="inline-block bg-[#1A5C38] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#154d30] transition-colors">
            Open PDF →
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.content}</div>
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Meeting Minutes</h2>
      <p className="text-gray-500 text-sm mb-6">Board meeting records and official minutes</p>

      {loading ? <div className="text-gray-400 text-sm">Loading…</div> : (
        minutes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No meeting minutes published yet.</div>
        ) : (
          <div className="space-y-3">
            {minutes.map(m => {
              const date = m.meeting_date ? new Date(m.meeting_date + 'T12:00:00') : null
              return (
                <button key={m.id} onClick={() => setSelected(m)}
                  className="w-full bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:border-[#1A5C38] hover:shadow-sm transition-all text-left">
                  {date && (
                    <div className="w-12 text-center bg-[#EAF3DE] rounded-xl py-2 flex-shrink-0">
                      <div className="text-lg font-bold text-[#1A5C38] leading-none">{date.getDate()}</div>
                      <div className="text-xs text-[#1A5C38] uppercase font-semibold">{date.toLocaleDateString('en-US',{month:'short'})}</div>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{m.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {m.meeting_type && <span className="text-xs text-[#1D4ED8] bg-[#EEF4FF] px-2 py-0.5 rounded-full">{m.meeting_type}</span>}
                      {m.published_by && <span className="text-xs text-gray-400">{m.published_by}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{m.pdf_url ? 'PDF' : 'Text'}</span>
                </button>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
