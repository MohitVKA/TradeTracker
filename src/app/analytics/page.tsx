'use client'

import { useEffect, useState } from 'react'
import { Trade } from '@/types'
import { getTrades } from '@/lib/storage'
import { buildEquityCurve, buildStrategyStats, computeDashboardStats } from '@/lib/calculations'
import { EquityChart } from '@/components/charts/EquityChart'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { ChartSkeleton } from '@/components/ui/Skeleton'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { cn } from '@/lib/utils'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-muted-foreground mb-1.5 font-medium">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="font-mono font-semibold" style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTrades(getTrades())
    setLoaded(true)
  }, [])

  const equityData     = buildEquityCurve(trades)
  const strategyStats  = buildStrategyStats(trades)
  const stats          = computeDashboardStats(trades)

  const winLossData = [
    { name: 'Wins',      value: stats.totalWins },
    { name: 'Losses',    value: stats.totalLosses },
    { name: 'Breakeven', value: trades.filter(t => t.result === 'Breakeven').length },
  ].filter(d => d.value > 0)

  const dayDist = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, i) => {
    const dayTrades = trades.filter(t => new Date(t.date).getDay() === i)
    return { day, count: dayTrades.length, pnl: parseFloat(dayTrades.reduce((s,t) => s + t.pnl, 0).toFixed(2)) }
  })

  const monthlyMap = new Map<string, number>()
  trades.forEach(t => {
    const m = t.date.substring(0, 7)
    monthlyMap.set(m, (monthlyMap.get(m) || 0) + t.pnl)
  })
  const monthlyData = Array.from(monthlyMap.entries())
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([month, pnl]) => ({ month: month.replace('-', '/'), pnl: parseFloat(pnl.toFixed(2)) }))

  const rBuckets: Record<string,number> = {'< -2R':0,'-2R to -1R':0,'-1R to 0R':0,'0R to 1R':0,'1R to 2R':0,'2R to 3R':0,'> 3R':0}
  trades.forEach(t => {
    const r = t.rMultiple
    if (r < -2) rBuckets['< -2R']++
    else if (r < -1) rBuckets['-2R to -1R']++
    else if (r < 0)  rBuckets['-1R to 0R']++
    else if (r < 1)  rBuckets['0R to 1R']++
    else if (r < 2)  rBuckets['1R to 2R']++
    else if (r < 3)  rBuckets['2R to 3R']++
    else rBuckets['> 3R']++
  })
  const rDistData = Object.entries(rBuckets).map(([r, count]) => ({ r, count }))

  const card = 'rounded-lg border border-border bg-card p-5 shadow-card'
  const axisProps = {
    tick: { fontSize: 10, fill: 'hsl(215 10% 46%)' },
    tickLine: false as const,
    axisLine: false as const,
  }

  if (!loaded) {
    return (
      <PageWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({length:6}).map((_,i) => <ChartSkeleton key={i} height={200} />)}
        </div>
      </PageWrapper>
    )
  }

  if (trades.length === 0) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64 rounded-lg border border-border bg-card text-muted-foreground text-sm">
          No data yet — add some trades first
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      {/* Equity curve — full width */}
      <div className={cn(card, 'mb-4')}>
        <h2 className="font-semibold text-foreground text-sm mb-4">Equity Curve</h2>
        <EquityChart data={equityData} height={220} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* PnL by Strategy */}
        <div className={card}>
          <h2 className="font-semibold text-foreground text-sm mb-4">PnL by Strategy</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={strategyStats} margin={{top:4,right:4,left:0,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 16%)" vertical={false} />
              <XAxis dataKey="strategy" {...axisProps} />
              <YAxis {...axisProps}
                tickFormatter={v => `$${Math.abs(v) >= 1000 ? (v/1000).toFixed(1)+'k' : v.toFixed(0)}`}
                width={46}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalPnl" name="PnL" radius={[3,3,0,0]}>
                {strategyStats.map((e,i) => (
                  <Cell key={i} fill={e.totalPnl >= 0 ? 'hsl(142 71% 45%)' : 'hsl(0 72% 51%)'} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Win/Loss Pie */}
        <div className={card}>
          <h2 className="font-semibold text-foreground text-sm mb-4">Win / Loss Split</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={winLossData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                paddingAngle={3} dataKey="value">
                {winLossData.map((_,i) => (
                  <Cell key={i}
                    fill={i===0 ? 'hsl(142 71% 45%)' : i===1 ? 'hsl(0 72% 51%)' : 'hsl(45 80% 52%)'}
                    fillOpacity={0.85}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={v => <span className="text-xs text-muted-foreground">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly PnL */}
        <div className={card}>
          <h2 className="font-semibold text-foreground text-sm mb-4">Monthly PnL</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{top:4,right:4,left:0,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 16%)" vertical={false} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps}
                tickFormatter={v => `$${Math.abs(v) >= 1000 ? (v/1000).toFixed(1)+'k' : v.toFixed(0)}`}
                width={46}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pnl" name="PnL" radius={[3,3,0,0]}>
                {monthlyData.map((e,i) => (
                  <Cell key={i} fill={e.pnl >= 0 ? 'hsl(213 60% 52%)' : 'hsl(0 72% 51%)'} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* R Multiple Distribution */}
        <div className={card}>
          <h2 className="font-semibold text-foreground text-sm mb-4">R Multiple Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rDistData} margin={{top:4,right:4,left:0,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 16%)" vertical={false} />
              <XAxis dataKey="r" {...axisProps} tick={{...axisProps.tick, fontSize:9}} />
              <YAxis {...axisProps} width={28} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Trades" radius={[3,3,0,0]}>
                {rDistData.map((e,i) => (
                  <Cell key={i}
                    fill={e.r.startsWith('<') || e.r.startsWith('-') ? 'hsl(0 72% 51%)' : 'hsl(142 71% 45%)'}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Day of week */}
      <div className={cn(card, 'mb-4')}>
        <h2 className="font-semibold text-foreground text-sm mb-4">PnL by Day of Week</h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dayDist} margin={{top:4,right:4,left:0,bottom:4}}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 16%)" vertical={false} />
            <XAxis dataKey="day" {...axisProps} />
            <YAxis {...axisProps}
              tickFormatter={v => `$${Math.abs(v) >= 1000 ? (v/1000).toFixed(1)+'k' : v.toFixed(0)}`}
              width={46}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pnl" name="PnL" radius={[3,3,0,0]}>
              {dayDist.map((e,i) => (
                <Cell key={i} fill={e.pnl >= 0 ? 'hsl(213 60% 52%)' : 'hsl(0 72% 51%)'} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Strategy table */}
      <div className={card}>
        <h2 className="font-semibold text-foreground text-sm mb-4">Strategy Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Strategy','Trades','Win Rate','Total PnL','Avg R'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-[0.08em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {strategyStats.map(s => (
                <tr key={s.strategy} className="hover:bg-accent/60 transition-colors">
                  <td className="px-3 py-3 font-medium text-foreground text-sm">{s.strategy}</td>
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{s.trades}</td>
                  <td className={cn('px-3 py-3 font-mono text-xs', s.winRate >= 50 ? 'text-profit' : 'text-loss')}>
                    {s.winRate.toFixed(1)}%
                  </td>
                  <td className={cn('px-3 py-3 font-mono font-semibold text-sm', s.totalPnl >= 0 ? 'text-profit' : 'text-loss')}>
                    {s.totalPnl >= 0 ? '+' : ''}{s.totalPnl.toFixed(2)}
                  </td>
                  <td className={cn('px-3 py-3 font-mono text-xs', s.avgRMultiple >= 0 ? 'text-profit' : 'text-loss')}>
                    {s.avgRMultiple >= 0 ? '+' : ''}{s.avgRMultiple.toFixed(2)}R
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  )
}
