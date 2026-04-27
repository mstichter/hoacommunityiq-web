'use client'
import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function ProfileSection({ resident, onUpdate }: { resident: any; onUpdate: (updated: any) => void }) {
  const [fullName, setFullName] = useState(resident.full_name || '')
  const [address, setAddress]   = useState(resident.address   || '')
  const [lotNumber, setLotNumber] = useState(resident.lot_number || '')
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) { setError('Name is required.'); return }
    setError('')
    setSaving(true)

    const updates = {
      full_name:  fullName.trim(),
      address:    address.trim()    || null,
      lot_number: lotNumber.trim()  || null,
    }

    const { error: dbError } = await supabase
      .from('residents')
      .update(updates)
      .eq('id', resident.id)

    setSaving(false)
    if (dbError) { setError(dbError.message); return }

    onUpdate({ ...resident, ...updates })
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const initials = fullName.trim().split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-1">My Profile</h2>
      <p className="text-gray-500 text-sm mb-6">Update your name and address on file with the HOA.</p>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-[#1A5C38] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{fullName || 'Resident'}</div>
          <div className="text-sm text-gray-400">{resident.role ? resident.role.charAt(0).toUpperCase() + resident.role.slice(1).replace('_',' ') : 'Resident'}</div>
        </div>
      </div>

      <form onSubmit={save} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Full Name *</label>
          <input
            type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
            placeholder="Jane Smith"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Home Address</label>
          <input
            type="text" value={address} onChange={e => setAddress(e.target.value)}
            placeholder="123 Oak Street"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Lot / Unit Number</label>
          <input
            type="text" value={lotNumber} onChange={e => setLotNumber(e.target.value)}
            placeholder="42"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A5C38] transition-colors"
          />
        </div>

        <div className="pt-1 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email</label>
          <div className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 bg-gray-50">
            {resident.email || 'Not available'}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Email cannot be changed here. Contact your board to update it.</p>
        </div>

        {error   && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="bg-[#EAF3DE] border border-[#1A5C38]/20 rounded-xl px-4 py-3 text-sm text-[#1A5C38] font-medium">✓ Profile updated successfully.</div>}

        <button
          type="submit" disabled={saving}
          className="w-full bg-[#1A5C38] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#154d30] transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
