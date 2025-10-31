/*
 * Payouts page
 *
 * This page displays monthly payout summaries for the logged‑in affiliate. Each
 * payout includes the date range it covers, total revenue, commission
 * amount, and status (e.g., pending, approved, paid). Use this page to
 * monitor your earnings and payout history.
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card } from '@/components/ui/card'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

interface Payout {
  id: string
  period_start: string
  period_end: string
  revenue_cents: number
  commission_cents: number
  status: string
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('payouts')
        .select('id, period_start, period_end, revenue_cents, commission_cents, status')
        .order('period_start', { ascending: false })
      setPayouts((data || []) as Payout[])
      setLoading(false)
    })()
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Payouts</h2>
      {loading ? (
        <p>Loading...</p>
      ) : payouts.length === 0 ? (
        <p>No payouts yet.</p>
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
            <thead className="bg-neutral-100 dark:bg-neutral-900">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">Period</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Revenue</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Commission</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                  <td className="px-4 py-2 whitespace-nowrap">
                    {p.period_start} – {p.period_end}
                  </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      ${ (p.revenue_cents / 100).toFixed(2) }
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      ${ (p.commission_cents / 100).toFixed(2) }
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap capitalize">
                      {p.status}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}