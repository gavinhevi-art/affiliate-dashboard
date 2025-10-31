/*
 * Dashboard page
 *
 * This page presents high‑level analytics for affiliates. It features a
 * configurable date range picker, summary metrics (clicks, conversions,
 * revenue, EPC, CVR), and an interactive line chart. Users can toggle
 * individual series on the chart for more focus. The data comes directly
 * from the `v_affiliate_stats_daily` view and respects RLS policies.
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card } from '@/components/ui/card'
import { format, subDays } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

interface StatRow {
  day: string
  clicks: number
  conversions: number
  revenue_cents: number
}

export default function Dashboard() {
  // Date range defaults: last 30 days
  const [startDate, setStartDate] = useState<string>(() => format(subDays(new Date(), 29), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'))
  const [rows, setRows] = useState<StatRow[]>([])
  const [loading, setLoading] = useState(false)

  // Chart visibility toggles
  const [showClicks, setShowClicks] = useState(true)
  const [showConversions, setShowConversions] = useState(true)
  const [showRevenue, setShowRevenue] = useState(true)

  // Derived totals
  const totals = rows.reduce(
    (acc, r) => {
      acc.clicks += r.clicks
      acc.conversions += r.conversions
      acc.revenue_cents += r.revenue_cents
      return acc
    },
    { clicks: 0, conversions: 0, revenue_cents: 0 },
  )

  const epc = totals.clicks ? totals.revenue_cents / 100 / totals.clicks : 0
  const cvr = totals.clicks ? totals.conversions / totals.clicks : 0

  async function fetchData() {
    setLoading(true)
    // Fetch daily stats within range for current user
    const { data, error } = await supabase
      .from('v_affiliate_stats_daily')
      .select('day, clicks, conversions, revenue_cents')
      .gte('day', startDate)
      .lte('day', endDate)
      .order('day', { ascending: true })
    if (!error && data) {
      setRows(
        data.map((r) => ({
          day: r.day as string,
          clicks: r.clicks || 0,
          conversions: r.conversions || 0,
          revenue_cents: r.revenue_cents || 0,
        })),
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onApplyRange = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData().catch(() => {})
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Overview</h2>
      <form onSubmit={onApplyRange} className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label htmlFor="start" className="text-sm mb-1">Start Date</label>
          <input
            id="start"
            type="date"
            className="border rounded px-3 py-2 dark:bg-neutral-800"
            value={startDate}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="end" className="text-sm mb-1">End Date</label>
          <input
            id="end"
            type="date"
            className="border rounded px-3 py-2 dark:bg-neutral-800"
            value={endDate}
            min={startDate}
            max={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          Apply
        </button>
      </form>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Metric title="Clicks" value={totals.clicks} />
        <Metric title="Conversions" value={totals.conversions} />
        <Metric title="Revenue" value={`$${(totals.revenue_cents / 100).toFixed(2)}`} />
        <Metric title="EPC" value={`$${epc.toFixed(2)}`} />
        <Metric title="CVR" value={`${(cvr * 100).toFixed(2)}%`} />
      </div>
      <Card className="p-4 space-y-4">
        <div className="flex gap-4 items-center flex-wrap">
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={showClicks}
              onChange={() => setShowClicks((v) => !v)}
            />
            Clicks
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={showConversions}
              onChange={() => setShowConversions((v) => !v)}
            />
            Conversions
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={showRevenue}
              onChange={() => setShowRevenue((v) => !v)}
            />
            Revenue
          </label>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={rows.map((r) => ({
                day: format(new Date(r.day), 'MMM d'),
                clicks: r.clicks,
                conversions: r.conversions,
                revenue: r.revenue_cents / 100,
              }))}
            >
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value: number) => (typeof value === 'number' ? value.toFixed(2) : value)} />
              <Legend />
              {showClicks && <Line type="monotone" dataKey="clicks" stroke="#3b82f6" dot={false} />}
              {showConversions && <Line type="monotone" dataKey="conversions" stroke="#10b981" dot={false} />}
              {showRevenue && <Line type="monotone" dataKey="revenue" stroke="#f59e0b" dot={false} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: number | string }) {
  return (
    <Card className="p-4">
      <div className="text-sm text-neutral-500 dark:text-neutral-400">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </Card>
  )
}