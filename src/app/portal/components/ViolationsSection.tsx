'use client'
import { useState } from 'react'
import { supabase } from '../supabaseClient'

const CATEGORIES = ['Landscaping','Parking','Exterior Modification','Noise','Pet','Trash & Recycling','Pool Rules','Other']

export default function ViolationsSection({ resident }: { resident: any }) {
  const [anonymous, setAnonymous]     = useState(false)
  const [category, setCategory]       = useState('')
  const [address, setAddress]         = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto]             = useState<File | null>(null)
  const [submitting, setSubmitting]   = useState(false)
  const [token, setToken]             = useState('')
  const [error, setError]             = useState('')

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photo) return null
    const ext  = photo.name.split('.').pop()
    const path = `violations/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('documents').upload(path, photo)
    if (error) return null
    return supabase.storage.from('documents').getPublicUrl(path).data.publicUrl
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) { setError('Please select a category.'); return }
    if (!description.trim()) { setError('Please describe the violation.'); return }
    setError('')
    setSubmitting(true)
    const photoUrl    = await uploadPhoto()
    const trackToken  = Math.random().toString(36).slice(2, 10).toUpperCase()
    await supabase.from('violations').insert([{
      hoa_id:            resident.hoa_id,
      reporter_id:       anonymous ? null : resident.id,
      reporter_name:     anonymous ? null : resident.full_name,
      violation_address: address.trim() || resident.address,
      category,
      description:       description.trim(),
      photo_url:         photoUrl,
      status:            'new',
      tracking_token:    trackToken,
    }])
    setToken(trackToken)
    setSubmitting(false)
  }

  if (token) return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-16 h-16 rounded-full bg-[#EAF3DE] flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Violation Reported</h2>
      <p className="text-gray-500 mb-6">Your report has been submitted to the board.</p>
      {anonymous && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
          <p className="text-gray-500 mb-1">Your anonymous tracking token:</p>
          <p className="font-mono font-bold text-lg text-[#1A5C38]">{token}</p>
          <p className="text-xs text-gray-400 mt-1">Save this to check status later.</p>
        </div>
      )}
      <button onClick={() => { setToken(''); setCategory(''); setDescription(''); setAddress(''); setPhoto(null) }}
        className="bg-[#1A5C38] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#154d30] transition-colors">
        Report Another
      </button>
    </div>
  )

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Report a Violation</h2>
      <p className="text-gray-500 text-sm mb-6">Reports can be submitted anonymously.</p>

      <form onSubmit={submit} className="space-y-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => setAnonymous(!anonymous)}
            className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${anonymous ? 'bg-[#1A5C38]' : 'bg-gray-200'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${anonymous ? 'translate-x-5' : ''}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">Submit anonymously</span>
        </label>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} type="button" onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${category === c ? 'bg-[#1A5C38] text-white border-[#1A5C38]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A5C38]'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Address of Violation</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)}
            placeholder={resident.address || 'Street address of the violation'}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description *</label>
          <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4}
            placeholder="Describe what you observed…"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors resize-none" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Photo (optional)</label>
          <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#EAF3DE] file:text-[#1A5C38]" />
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

        <button type="submit" disabled={submitting}
          className="w-full bg-[#1A5C38] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#154d30] transition-colors disabled:opacity-60">
          {submitting ? 'Submitting…' : 'Submit Report'}
        </button>
      </form>
    </div>
  )
}
