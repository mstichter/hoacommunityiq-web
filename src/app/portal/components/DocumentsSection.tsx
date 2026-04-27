'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const DOC_COLORS: Record<string,{bg:string,color:string}> = {
  bylaws:     { bg:'#EEF4FF', color:'#1D4ED8' },
  ccrs:       { bg:'#F5F3FF', color:'#7C3AED' },
  arc:        { bg:'#EAF3DE', color:'#1A5C38' },
  amenities:  { bg:'#E0F2FE', color:'#0369A1' },
  policy:     { bg:'#FFF8E7', color:'#B45309' },
  other:      { bg:'#f0f0f0', color:'#555' },
}

function docColor(type: string) {
  const t = type?.toLowerCase() || ''
  if (t.includes('bylaw')) return DOC_COLORS.bylaws
  if (t.includes('ccr') || t.includes('covenant')) return DOC_COLORS.ccrs
  if (t.includes('arc') || t.includes('architect')) return DOC_COLORS.arc
  if (t.includes('amenit') || t.includes('pool')) return DOC_COLORS.amenities
  if (t.includes('policy') || t.includes('rule')) return DOC_COLORS.policy
  return DOC_COLORS.other
}

export default function DocumentsSection({ resident }: { resident: any }) {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState<any | null>(null)
  const [chunks, setChunks]       = useState<any[]>([])
  const [loadingDoc, setLoadingDoc] = useState(false)

  useEffect(() => {
    supabase.from('documents').select('*').eq('hoa_id', resident.hoa_id).order('title')
      .then(({ data }) => { setDocuments(data || []); setLoading(false) })
  }, [])

  const openDoc = async (doc: any) => {
    if (doc.pdf_url) { window.open(doc.pdf_url, '_blank'); return }
    setSelected(doc)
    setLoadingDoc(true)
    const { data } = await supabase.from('document_chunks').select('id, content, chunk_index')
      .eq('document_id', doc.id).order('chunk_index')
    setChunks(data || [])
    setLoadingDoc(false)
  }

  if (selected) return (
    <div className="max-w-2xl">
      <button onClick={() => setSelected(null)} className="text-[#1A5C38] text-sm font-medium hover:underline mb-4 block">← Back to Documents</button>
      <h2 className="text-xl font-bold text-gray-900 mb-4">{selected.title}</h2>
      {loadingDoc ? <div className="text-gray-400 text-sm">Loading…</div> : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 prose prose-sm max-w-none">
          {chunks.map(c => <p key={c.id} className="text-sm text-gray-700 mb-3 leading-relaxed">{c.content}</p>)}
          {chunks.length === 0 && <p className="text-gray-400">No content available.</p>}
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Documents</h2>
      <p className="text-gray-500 text-sm mb-6">CC&Rs, bylaws, rules, and policies</p>

      {loading ? <div className="text-gray-400 text-sm">Loading…</div> : (
        <div className="space-y-2">
          {documents.length === 0 && <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No documents available.</div>}
          {documents.map(doc => {
            const c = docColor(doc.type || doc.title)
            return (
              <button key={doc.id} onClick={() => openDoc(doc)}
                className="w-full bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:border-[#1A5C38] hover:shadow-sm transition-all text-left">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: c.bg }}>
                  📄
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">{doc.title}</div>
                  {doc.description && <div className="text-xs text-gray-400 mt-0.5">{doc.description}</div>}
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0" style={{ background: c.bg, color: c.color }}>
                  {doc.pdf_url ? 'PDF' : 'View'}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
