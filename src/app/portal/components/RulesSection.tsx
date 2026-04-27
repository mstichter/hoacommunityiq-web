'use client'
import { useState, useEffect } from 'react'
import { supabase, SUPABASE_URL, SUPABASE_ANON } from '../supabaseClient'


export default function RulesSection({ resident, onAskBoard }: { resident: any; onAskBoard?: (question: string) => void }) {
  const [documents, setDocuments]   = useState<any[]>([])
  const [selectedDoc, setSelectedDoc] = useState('all')
  const [question, setQuestion]     = useState('')
  const [answer, setAnswer]         = useState('')
  const [sources, setSources]       = useState<any[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    supabase.from('documents').select('id, name, type').eq('hoa_id', resident.hoa_id)
      .then(({ data }) => setDocuments(data || []))
  }, [])

  const ask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setAnswer('')
    setSources([])
    setError('')

    // Try vector search first, fall back to keyword
    let chunks: any[] = []
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/search-chunks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON}` },
        body: JSON.stringify({ question: question.trim(), documentId: selectedDoc, hoaId: resident.hoa_id }),
      })
      const data = await res.json()
      if (data.chunks?.length > 0) chunks = data.chunks
    } catch {}

    if (chunks.length === 0) {
      // Keyword fallback
      const words = question.toLowerCase().replace(/[^a-z0-9 ]/g,'').split(' ').filter(w => w.length > 3)
      if (words.length > 0) {
        let q = supabase.from('document_chunks').select('id, content, document_id').eq('hoa_id', resident.hoa_id)
          .or(words.map(w => `content.ilike.%${w}%`).join(',')).limit(8)
        if (selectedDoc !== 'all') q = q.eq('document_id', selectedDoc)
        const { data } = await q
        chunks = data || []
      }
    }

    if (chunks.length === 0) {
      setAnswer("I couldn't find relevant information in the HOA documents. Try rephrasing your question, or ask the board directly.")
      setLoading(false)
      return
    }

    const context = chunks.slice(0, 6).map((c: any) => c.content).join('\n\n')
    setSources(chunks.slice(0, 3))

    try {
      const aiRes = await fetch('/api/ask-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, question: question.trim() }),
      })
      const aiData = await aiRes.json()
      setAnswer(aiData.answer || 'No answer available.')
    } catch {
      setAnswer(chunks[0]?.content || 'No answer available.')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Rules Assistant</h2>
      <p className="text-gray-500 text-sm mb-6">Ask questions about HOA rules and get instant answers</p>

      {onAskBoard && (
        <button type="button" onClick={() => onAskBoard('')}
          className="w-full bg-white border-2 border-[#1A5C38] text-[#1A5C38] py-3.5 rounded-xl font-semibold text-sm hover:bg-[#EAF3DE] transition-colors mb-6">
          💬 Send a Question to the Board
        </button>
      )}

      {/* Document filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setSelectedDoc('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedDoc==='all' ? 'bg-[#1A5C38] text-white border-[#1A5C38]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A5C38]'}`}>
          All Documents
        </button>
        {documents.map(d => (
          <button key={d.id} onClick={() => setSelectedDoc(d.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedDoc===d.id ? 'bg-[#1A5C38] text-white border-[#1A5C38]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A5C38]'}`}>
            {d.name}
          </button>
        ))}
      </div>

      <form onSubmit={ask} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="e.g. Can I park my RV in my driveway?"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
          />
          <button type="submit" disabled={loading || !question.trim()}
            className="bg-[#1A5C38] text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-[#154d30] transition-colors disabled:opacity-60 flex-shrink-0">
            {loading ? '…' : 'Ask'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
          Searching documents…
        </div>
      )}

      {answer && !loading && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#1A5C38]/20 p-6">
            <p className="text-sm font-bold text-[#1A5C38] mb-3">Answer</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{answer}</p>
          </div>

          {sources.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Sources</p>
              <div className="space-y-2">
                {sources.map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500 line-clamp-2">{s.content}</div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">This is AI-generated guidance. Consult the full documents or your board for official decisions.</p>

          {onAskBoard && (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 px-5 py-4 flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500">Still not sure? Ask the board directly.</p>
              <button type="button" onClick={() => onAskBoard(question)}
                className="flex-shrink-0 bg-[#1A5C38] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#154d30] transition-colors">
                Ask the Board →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
