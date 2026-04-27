import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { context, question } = await req.json()
  if (!context || !question) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: 'You are a helpful HOA assistant. Answer questions based only on the provided HOA document excerpts. Be concise and cite specific rules or sections when possible.',
      messages: [{ role: 'user', content: `HOA Document excerpts:\n\n${context}\n\nQuestion: ${question}` }],
    }),
  })

  const data = await res.json()
  return NextResponse.json({ answer: data.content?.[0]?.text || 'No answer available.' })
}
