'use client'

import { useEffect, useState } from 'react'
import { Trade } from '@/types'
import { getTrades } from '@/lib/storage'
import { buildEquityCurve, buildStrategyStats, computeDashboardStats } from '@/lib/calculations'
import { EquityChart } from '@/components/charts/EquityChart'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  ScatterChart, Scatter, ZAxis
} from 'recharts'
import { BarChart3 } from 'lucide-react'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-muted-foreground mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || p.fill }} className="font-mono font-semibold">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<Trade[]>([])

  useEffect(() => {
    setTrades(getTrades())
  }, [])

  const equityData = buildEquityCurve(trades)
  const strategyStats = buildStrategyStats(trades)
  const stats = computeDashboardStats(trades)

  // Win/Loss pie
  const winLossData = [
    { name: 'Wins', value: stats.totalWins },
    { name: 'Losses', value: stats.totalLosses },
    { name: 'Breakeven', value: trades.filter(t => t.result === 'Breakeven').length },
  ].filter(d => d.value > 0)

  // Trade distribution by day of week
  const dayDist = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
    const dayTrades = trades.filter(t => new Date(t.date).getDay() === i)
    const pnl = dayTrades.reduce((s, t) => s + t.pnl, 0)
    return { day, count: dayTrades.length, pnl }
  })

  // Monthly PnL
  const monthlyMap = new Map<string, number>()
  trades.forEach(t => {
    const month = t.date.substring(0, 7)
    monthlyMap.set(month, (monthlyMap.get(month) || 0) + t.pnl)
  })
  const monthlyData = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, pnl]) => ({ month: month.replace('-', '/'), pnl: parseFloat(pnl.toFixed(2)) }))

  // R multiple distribution
  const rBuckets: Record<string, number> = {
    '< -2R': 0, '-2R to -1R': 0, '-1R to 0R': 0,
    '0R to 1R': 0, '1R to 2R': 0, '2R to 3R': 0, '> 3R': 0
  }
  trades.forEach(t => {
    const r = t.rMultiple
    if (r < -2) rBuckets['< -2R']++
    else if (r < -1) rBuckets['-2R to -1R']++
    else if (r < 0) rBuckets['-1R to 0R']++
    else if (r < 1) rBuckets['0R to 1R']++
    else if (r < 2) rBuckets['1R to 2R']++
    else if (r < 3) rBuckets['2R to 3R']++
    else rBuckets['> 3R']++
  })
  const rDistData = Object.entries(rBuckets).map(([r, count]) => ({ r, count }))

  if (trades.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics</h1>
            <p className="text-muted-foreground text-sm">Log trades to see your analytics</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64 rounded-xl border border-border bg-card text-muted-foreground">
          No data yet — add some trades first
        </div>
      </div>
    )
  }

  const chartCardCls = 'rounded-xl border border-border bg-card p-5'

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm">Deep dive into your trading performance</p>
        </div>
      </div>

      {/* Equity Curve */}
      <div className={chartCardCls}>
        <h2 className="font-semibold text-foreground mb-4">Equity Curve</h2>
        <EquityChart data={equityData} height={240} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy PnL */}
        <div className={chartCardCls}>
          <h2 className="font-semibold text-foreground mb-4">PnL by Strategy</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={strategyStats} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="strategy" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false}
                tickFormatter={v => `$${v >= 0 ? '' : '-'}${Math.abs(v).toFixed(0)}`} width={48} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalPnl" name="PnL" radius={[4, 4, 0, 0]}>
                {strategyStats.map((entry, i) => (
                  <Cell key={i} fill={entry.totalPnl >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Win/Loss Pie */}
        <div className={chartCardCls}>
          <h2 className="font-semibold text-foreground mb-4">Win / Loss Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={winLossData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                paddingAngle={4} dataKey="value">
                {winLossData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#22c55e' : i === 1 ? '#ef4444' : '#f59e0b'} fillOpacity={0.85} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly PnL */}
        <div className={chartCardCls}>
          <h2 className="font-semibold text-foreground mb-4">Monthly PnL</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false}
                tickFormatter={v => `$${v >= 0 ? '' : '-'}${Math.abs(v).toFixed(0)}`} width={48} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pnl" name="Monthly PnL" radius={[4, 4, 0, 0]}>
                {monthlyData.map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? '#3b82f6' : '#ef4444'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* R Multiple Distribution */}
        <div className={chartCardCls}>
          <h2 className="font-semibold text-foreground mb-4">R Multiple Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rDistData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="r" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Trades" radius={[4, 4, 0, 0]}>
                {rDistData.map((entry, i) => (
                  <Cell key={i}
                    fill={entry.r.startsWith('<') || entry.r.startsWith('-') ? '#ef4444' : '#22c55e'}
                    fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Day of Week */}
      <div className={chartCardCls}>
        <h2 className="font-semibold text-foreground mb-4">PnL by Day of Week</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dayDist} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false}
              tickFormatter={v => `$${v >= 0 ? '' : '-'}${Math.abs(v).toFixed(0)}`} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pnl" name="PnL" radius={[4, 4, 0, 0]}>
              {dayDist.map((entry, i) => (
                <Cell key={i} fill={entry.pnl >= 0 ? '#3b82f6' : '#ef4444'} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Strategy Table */}
      <div className={chartCardCls}>
        <h2 className="font-semibold text-foreground mb-4">Strategy Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Strategy', 'Trades', 'Win Rate', 'Total PnL', 'Avg R'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {strategyStats.map(s => (
                <tr key={s.strategy} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{s.strategy}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{s.trades}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className={s.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>
                      {s.winRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-mono font-semibold text-sm ${s.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {s.totalPnl >= 0 ? '+' : ''}{s.totalPnl.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 font-mono text-xs ${s.avgRMultiple >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {s.avgRMultiple >= 0 ? '+' : ''}{s.avgRMultiple.toFixed(2)}R
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
