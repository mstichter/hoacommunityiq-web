'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const STATUS_LABELS: Record<string,string> = { open:'Open', answered:'Answered', closed:'Closed' }
const STATUS_COLORS: Record<string,string> = { open:'#B45309', answered:'#166534', closed:'#888' }
const STATUS_BG: Record<string,string>     = { open:'#FFF8E7', answered:'#EAF3DE', closed:'#f0f0f0' }

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default function ContactBoardSection({ resident, prefill = '' }: { resident: any; prefill?: string }) {
  const [view, setView]           = useState<'list'|'new'>(prefill ? 'new' : 'list')
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [subject, setSubject]     = useState(prefill)
  const [message, setMessage]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => { fetchQuestions() }, [])

  useEffect(() => {
    if (prefill) { setSubject(prefill); setView('new') }
  }, [prefill])

  const fetchQuestions = async () => {
    const { data } = await supabase.from('board_questions')
      .select('*')
      .eq('hoa_id', resident.hoa_id)
      .eq('resident_id', resident.id)
      .order('created_at', { ascending: false })
    setQuestions(data || [])
    setLoading(false)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) { setError('Please enter your question.'); return }
    setError('')
    setSubmitting(true)
    await supabase.from('board_questions').insert([{
      hoa_id:        resident.hoa_id,
      resident_id:   resident.id,
      resident_name: resident.full_name,
      resident_email: resident.email,
      subject:       subject.trim() || null,
      message:       message.trim(),
      status:        'open',
    }])
    setSubmitting(false)
    setSuccess(true)
    fetchQuestions()
    setTimeout(() => { setSuccess(false); setView('list'); setSubject(''); setMessage('') }, 2500)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Ask the Board</h2>
          <p className="text-gray-500 text-sm">Send a question directly to the board or property manager</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('list')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view==='list' ? 'bg-[#1A5C38] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>My Questions</button>
          <button onClick={() => setView('new')}  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view==='new'  ? 'bg-[#1A5C38] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Ask a Question</button>
        </div>
      </div>

      {view === 'list' && (
        loading ? <div className="text-gray-400 text-sm">Loading…</div> : (
          questions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-gray-500 text-sm mb-4">No questions yet. The board is here to help.</p>
              <button onClick={() => setView('new')} className="bg-[#1A5C38] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#154d30] transition-colors">Ask a Question</button>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map(q => (
                <div key={q.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {q.subject || (q.message.length > 60 ? q.message.slice(0, 60) + '…' : q.message)}
                    </h3>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: STATUS_BG[q.status]||'#f0f0f0', color: STATUS_COLORS[q.status]||'#888' }}>
                      {STATUS_LABELS[q.status]||q.status}
                    </span>
                  </div>
                  {q.subject && <p className="text-sm text-gray-500 mb-2 line-clamp-2">{q.message}</p>}
                  <p className="text-xs text-gray-400">Sent {fmtDate(q.created_at)}</p>
                  {q.board_reply && (
                    <div className="mt-3 bg-[#EAF3DE] rounded-xl px-4 py-3">
                      <p className="text-xs font-bold text-[#1A5C38] mb-1">Board Reply</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{q.board_reply}</p>
                      {q.replied_at && <p className="text-xs text-gray-400 mt-1.5">{fmtDate(q.replied_at)}</p>}
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
          {success && (
            <div className="bg-[#EAF3DE] border border-[#1A5C38]/20 rounded-xl px-5 py-4 text-sm text-[#1A5C38] font-medium">
              ✓ Your question has been sent. The board will reply shortly.
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Subject</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Parking rule clarification"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Question *</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} required
              placeholder="What would you like to ask the board?"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors resize-none" />
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="flex-1 bg-[#1A5C38] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#154d30] transition-colors disabled:opacity-60">
              {submitting ? 'Sending…' : 'Send Question'}
            </button>
            <button type="button" onClick={() => setView('list')}
              className="px-5 py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
