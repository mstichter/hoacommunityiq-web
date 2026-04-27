import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { name, email, hoaName, homes, message } = await req.json()

  if (!name || !email || !hoaName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await resend.emails.send({
    from: 'CommunityIQ <hello@hoacommunityiq.com>',
    to: 'matt@hoacommunityiq.com',
    subject: `New inquiry from ${hoaName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1A5C38; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 20px;">New CommunityIQ Inquiry</h2>
        </div>
        <div style="background: #f9f9f9; padding: 32px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px; width: 140px;">Name</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px;">Email</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px;">HOA / Community</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${hoaName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px;">Number of Homes</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${homes || 'Not specified'}</td>
            </tr>
            ${message ? `
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px; vertical-align: top;">Message</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px;">${message}</td>
            </tr>` : ''}
          </table>
        </div>
      </div>
    `,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
