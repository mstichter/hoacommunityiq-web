import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  'https://sdcvfxontkwfvcezsilm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const resend = new Resend(process.env.RESEND_API_KEY)

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function POST(req: NextRequest) {
  const { hoaName, adminName, adminEmail, password, homesCount } = await req.json()

  if (!hoaName || !adminName || !adminEmail || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const hoaId = slugify(hoaName) + '-' + Date.now().toString(36)

  // Create the HOA record
  const { error: hoaError } = await supabaseAdmin.from('hoas').insert([{
    id: hoaId,
    name: hoaName,
  }])
  if (hoaError) return NextResponse.json({ error: hoaError.message }, { status: 500 })

  // Create the Supabase auth user
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password,
    email_confirm: true,
  })
  if (userError) {
    await supabaseAdmin.from('hoas').delete().eq('id', hoaId)
    return NextResponse.json({ error: userError.message }, { status: 500 })
  }

  // Create the resident record as board admin
  const { error: residentError } = await supabaseAdmin.from('residents').insert([{
    id: userData.user.id,
    full_name: adminName,
    hoa_id: hoaId,
    role: 'board',
  }])
  if (residentError) return NextResponse.json({ error: residentError.message }, { status: 500 })

  // Send welcome email
  await resend.emails.send({
    from: 'CommunityIQ <hello@hoacommunityiq.com>',
    to: adminEmail,
    subject: 'Welcome to CommunityIQ — your dashboard is ready',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1A5C38; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 20px;">Welcome to CommunityIQ 🏘️</h2>
        </div>
        <div style="background: #f9f9f9; padding: 32px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #333; font-size: 15px;">Hi ${adminName},</p>
          <p style="color: #333; font-size: 15px;">Your CommunityIQ board dashboard for <strong>${hoaName}</strong> is ready.</p>
          <a href="https://app.hoacommunityiq.com" style="display: inline-block; background: #1A5C38; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
            Open Board Dashboard →
          </a>
          <p style="color: #555; font-size: 14px;">Log in with:</p>
          <p style="color: #555; font-size: 14px;"><strong>Email:</strong> ${adminEmail}<br/><strong>Password:</strong> the password you chose during signup</p>
          <p style="color: #888; font-size: 13px; margin-top: 24px;">Questions? Reply to this email or contact us at matt@hoacommunityiq.com</p>
        </div>
      </div>
    `,
  })

  return NextResponse.json({ success: true, hoaId })
}
