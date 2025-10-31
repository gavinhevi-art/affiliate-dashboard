import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const GIF_1X1 = Uint8Array.from([
  71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 255, 255, 255, 0, 0, 0, 33, 249,
  4, 1, 0, 0, 1, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59,
])

export async function GET(req: NextRequest) {
  const admin = supabaseAdmin()
  const url = new URL(req.url)
  const linkId = url.searchParams.get('link_id')
  const sessionId = url.searchParams.get('sid')
  const cents = parseInt(url.searchParams.get('rev') || '0', 10)
  const order = url.searchParams.get('oid') || undefined
  const currency = url.searchParams.get('cur') || 'USD'

  if (linkId && sessionId) {
    await admin.from('conversions').insert({
      link_id: linkId,
      session_id: sessionId,
      revenue_cents: isFinite(cents) ? cents : 0,
      external_order_id: order,
      currency,
    })
  }

  return new NextResponse(GIF_1X1, {
    headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store' },
  })
}