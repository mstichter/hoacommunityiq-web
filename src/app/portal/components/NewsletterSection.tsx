'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

export default function NewsletterSection({ resident }: { resident: any }) {
  const [newsletters, setNewsletters] = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState<any | null>(null)

  useEffect(() => {
    supabase.from('newsletters').select('*').eq('hoa_id', resident.hoa_id)
      .order('published_at', { ascending: false })
      .then(({ data }) => { setNewsletters(data || []); setLoading(false) })
  }, [])

  if (selected) return (
    <div className="max-w-2xl">
      <button onClick={() => setSelected(null)} className="text-[#1A5C38] text-sm font-medium hover:underline mb-4 block">← Back to Newsletters</button>
      <h2 className="text-xl font-bold text-gray-900 mb-1">{selected.title}</h2>
      <p className="text-gray-400 text-sm mb-6">{selected.published_by && `${selected.published_by} · `}{fmtDate(selected.published_at)}</p>
      {selected.pdf_url ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-500 text-sm mb-4">This newsletter is available as a PDF.</p>
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
      <h2 className="text-xl font-bold text-gray-900 mb-1">Newsletter</h2>
      <p className="text-gray-500 text-sm mb-6">Community updates from your board</p>

      {loading ? <div className="text-gray-400 text-sm">Loading…</div> : (
        newsletters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No newsletters published yet.</div>
        ) : (
          <div className="space-y-3">
            {newsletters.map(nl => (
              <button key={nl.id} onClick={() => setSelected(nl)}
                className="w-full bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:border-[#1A5C38] hover:shadow-sm transition-all text-left">
                <div className="w-12 h-12 rounded-xl bg-[#EAF3DE] flex items-center justify-center text-xl flex-shrink-0">📰</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{nl.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{nl.published_by && `${nl.published_by} · `}{fmtDate(nl.published_at)}</div>
                  {nl.content && <div className="text-xs text-gray-500 mt-1 line-clamp-1">{nl.content.slice(0,100)}</div>}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{nl.pdf_url ? 'PDF' : 'Text'}</span>
              </button>
            ))}
          </div>
        )
      )}
    </div>
  )
}
