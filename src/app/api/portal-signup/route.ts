import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  'https://sdcvfxontkwfvcezsilm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const { fullName, email, password, address, hoaId } = await req.json()

  if (!fullName || !email || !password || !hoaId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Create the auth user
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (userError) return NextResponse.json({ error: userError.message }, { status: 500 })

  // Create the resident record
  const { error: residentError } = await supabaseAdmin.from('residents').insert([{
    id: userData.user.id,
    full_name: fullName,
    hoa_id: hoaId,
    address: address || null,
    role: 'resident',
  }])
  if (residentError) {
    await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
    return NextResponse.json({ error: residentError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
