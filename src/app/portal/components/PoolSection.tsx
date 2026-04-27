'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const CLOSURE_REASONS: Record<string,string> = {
  lightning:   'Lightning / Severe Weather',
  water:       'Water Quality Issue',
  maintenance: 'Maintenance / Equipment',
  capacity:    'At Capacity',
  health:      'Health / Sanitary Concern',
  event:       'Special Event',
  other:       'Other',
}

const fmtDate = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export default function PoolSection({ resident }: { resident: any }) {
  const [features, setFeatures] = useState<any[]>([])
  const [statuses, setStatuses] = useState<Record<string, any>>({})
  const [loading, setLoading]   = useState(true)

  useEffect(() => { fetchFeatures() }, [])

  const fetchFeatures = async () => {
    const { data: featureData } = await supabase.from('water_features').select('*')
      .eq('hoa_id', resident.hoa_id).eq('is_active', true).order('display_order')
    if (!featureData) { setLoading(false); return }
    setFeatures(featureData)

    const statusMap: Record<string, any> = {}
    for (const f of featureData) {
      const { data } = await supabase.from('water_feature_status').select('*')
        .eq('feature_id', f.id).order('created_at', { ascending: false }).limit(1).single()
      if (data) statusMap[f.id] = data
    }
    setStatuses(statusMap)
    setLoading(false)
  }

  const featureColor = (type: string) => {
    if (type?.includes('pool') || type?.includes('Pool')) return { bg: '#E0F2FE', border: '#0369A1', text: '#0369A1' }
    if (type?.includes('hot') || type?.includes('spa')) return { bg: '#FFF8E7', border: '#B45309', text: '#B45309' }
    if (type?.includes('lazy') || type?.includes('river')) return { bg: '#EEF4FF', border: '#1D4ED8', text: '#1D4ED8' }
    return { bg: '#EAF3DE', border: '#1A5C38', text: '#1A5C38' }
  }

  if (loading) return <div className="text-gray-400 text-sm">Loading…</div>

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Pool & Water Features</h2>
      <p className="text-gray-500 text-sm mb-6">Current status of all community water features</p>

      {features.length === 0 && <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No water features found.</div>}

      <div className="grid sm:grid-cols-2 gap-4">
        {features.map(f => {
          const status = statuses[f.id]
          const isOpen = status?.is_open !== false
          const c = featureColor(f.type || f.name)
          return (
            <div key={f.id} className="bg-white rounded-2xl border p-5" style={{ borderColor: c.border + '40' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">{f.name}</h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isOpen ? 'bg-[#EAF3DE] text-[#166534]' : 'bg-[#FCEBEB] text-[#A32D2D]'}`}>
                  {isOpen ? '● Open' : '● Closed'}
                </span>
              </div>
              {!isOpen && status?.closure_reason && (
                <p className="text-sm text-gray-500 mb-2">
                  {CLOSURE_REASONS[status.closure_reason] || status.closure_reason}
                </p>
              )}
              {status && (
                <p className="text-xs text-gray-400">Updated {fmtDate(status.created_at)}</p>
              )}
              {!status && <p className="text-xs text-gray-400">No status posted yet</p>}
            </div>
          )
        })}
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">Status is updated by pool staff. Refresh the page to see the latest.</p>
    </div>
  )
}
