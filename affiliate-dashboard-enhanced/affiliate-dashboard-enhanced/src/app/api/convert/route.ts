import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const admin = supabaseAdmin()
  const body = (await req.json().catch(() => ({}))) as any
  const {
    link_id,
    session_id,
    revenue_cents = 0,
    external_order_id,
    currency = 'USD',
    meta,
  } = body

  if (!link_id || !session_id) {
    return NextResponse.json({ error: 'link_id and session_id required' }, { status: 400 })
  }

  await admin.from('conversions').insert({
    link_id,
    session_id,
    revenue_cents,
    external_order_id,
    currency,
    meta,
  })
  return NextResponse.json({ ok: true })
}