'use client'

import { useEffect, useState } from 'react'
import { Trade } from '@/types'
import { getTrades } from '@/lib/storage'
import { buildEquityCurve, buildStrategyStats, computeDashboardStats } from '@/lib/calculations'
import { EquityChart } from '@/components/charts/EquityChart'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { cn } from '@/lib/utils'

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-[12px] shadow-xl">
      <div className="text-[hsl(var(--fg-muted))] mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="font-mono font-semibold" style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </div>
      ))}
    </div>
  )
}

const ax = { tick: { fontSize: 10, fill: 'hsl(var(--fg-subtle))', fontFamily: 'Geist Mono, monospace' }, tickLine: false as const, axisLine: false as const }
const P = 'hsl(142 76% 42%)'
const L = 'hsl(0 72% 51%)'
const B = 'hsl(var(--fg-muted))'

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { setTrades(getTrades()); setLoaded(true) }, [])

  const eq      = buildEquityCurve(trades)
  const strats  = buildStrategyStats(trades)
  const stats   = computeDashboardStats(trades)

  const pie     = [{ name: 'Wins', value: stats.totalWins }, { name: 'Losses', value: stats.totalLosses }, { name: 'BE', value: trades.filter(t => t.result === 'Breakeven').length }].filter(d => d.value > 0)
  const days    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day,i) => { const dt = trades.filter(t => new Date(t.date).getDay() === i); return { day, pnl: parseFloat(dt.reduce((s,t) => s+t.pnl,0).toFixed(2)) } })
  const monthly = (() => { const m = new Map<string,number>(); trades.forEach(t => m.set(t.date.substring(0,7),(m.get(t.date.substring(0,7))||0)+t.pnl)); return Array.from(m.entries()).sort(([a],[b])=>a.localeCompare(b)).map(([mo,pnl])=>({month:mo.replace('-','/'),pnl:parseFloat(pnl.toFixed(2))})) })()
  const rDist   = (() => { const b: Record<string,number> = {'<-2R':0,'-2R→-1R':0,'-1R→0R':0,'0R→1R':0,'1R→2R':0,'2R→3R':0,'>3R':0}; trades.forEach(t => { const r=t.rMultiple; if(r<-2)b['<-2R']++;else if(r<-1)b['-2R→-1R']++;else if(r<0)b['-1R→0R']++;else if(r<1)b['0R→1R']++;else if(r<2)b['1R→2R']++;else if(r<3)b['2R→3R']++;else b['>3R']++ }); return Object.entries(b).map(([r,count])=>({r,count})) })()

  const card = 'card p-5'
  const fmtY = (v: number) => `$${Math.abs(v)>=1000?(v/1000).toFixed(1)+'k':v.toFixed(0)}`

  if (!loaded) return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({length:6}).map((_,i) => <div key={i} className={cn(card,'space-y-3')}><div className="skeleton h-4 w-32 rounded"/><div className="skeleton w-full h-48 rounded-lg"/></div>)}
      </div>
    </PageWrapper>
  )

  if (!trades.length) return (
    <PageWrapper><div className={cn(card,'flex items-center justify-center h-64 text-[hsl(var(--fg-muted))] text-[13px]')}>No data yet — add some trades first</div></PageWrapper>
  )

  return (
    <PageWrapper>
      <div className={cn(card,'mb-4')}>
        <div className="text-[13px] font-semibold text-[hsl(var(--fg))] mb-4">Equity Curve</div>
        <EquityChart data={eq} height={220} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Strategy PnL */}
        <div className={card}>
          <div className="text-[13px] font-semibold text-[hsl(var(--fg))] mb-4">PnL by Strategy</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={strats} margin={{top:4,right:4,left:0,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="strategy" {...ax} />
              <YAxis {...ax} tickFormatter={fmtY} width={46} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="totalPnl" name="PnL" radius={[3,3,0,0]}>
                {strats.map((e,i) => <Cell key={i} fill={e.totalPnl>=0?P:L} fillOpacity={0.9} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className={card}>
          <div className="text-[13px] font-semibold text-[hsl(var(--fg))] mb-4">Win / Loss Split</div>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={pie} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                {pie.map((_,i) => <Cell key={i} fill={[P,L,'hsl(45 80% 52%)'][i]} fillOpacity={0.9} />)}
              </Pie>
              <Tooltip content={<Tip />} />
              <Legend formatter={v => <span className="text-[11px] text-[hsl(var(--fg-muted))]">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly */}
        <div className={card}>
          <div className="text-[13px] font-semibold text-[hsl(var(--fg))] mb-4">Monthly PnL</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={monthly} margin={{top:4,right:4,left:0,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" {...ax} />
              <YAxis {...ax} tickFormatter={fmtY} width={46} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="pnl" name="PnL" radius={[3,3,0,0]}>
                {monthly.map((e,i) => <Cell key={i} fill={e.pnl>=0?B:L} fillOpacity={0.9} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* R dist */}
        <div className={card}>
          <div className="text-[13px] font-semibold text-[hsl(var(--fg))] mb-4">R Multiple Distribution</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={rDist} margin={{top:4,right:4,left:0,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="r" {...ax} tick={{...ax.tick,fontSize:9}} />
              <YAxis {...ax} width={28} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" name="Trades" radius={[3,3,0,0]}>
                {rDist.map((e,i) => <Cell key={i} fill={e.r.startsWith('<')||e.r.startsWith('-')?L:P} fillOpacity={0.9} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={cn(card,'mb-4')}>
        <div className="text-[13px] font-semibold text-[hsl(var(--fg))] mb-4">PnL by Day of Week</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={days} margin={{top:4,right:4,left:0,bottom:4}}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" {...ax} />
            <YAxis {...ax} tickFormatter={fmtY} width={46} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="pnl" name="PnL" radius={[3,3,0,0]}>
              {days.map((e,i) => <Cell key={i} fill={e.pnl>=0?B:L} fillOpacity={0.9} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={card}>
        <div className="text-[13px] font-semibold text-[hsl(var(--fg))] mb-4">Strategy Breakdown</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Strategy','Trades','Win Rate','Total PnL','Avg R'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[11px] font-medium text-[hsl(var(--fg-muted))] uppercase tracking-[0.07em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {strats.map(s => (
                <tr key={s.strategy} className="hover:bg-[hsl(var(--bg-overlay))] transition-colors">
                  <td className="px-3 py-3 font-medium text-[hsl(var(--fg))]">{s.strategy}</td>
                  <td className="px-3 py-3 font-mono text-[12px] text-[hsl(var(--fg-muted))]">{s.trades}</td>
                  <td className={cn('px-3 py-3 font-mono text-[12px]', s.winRate>=50?'text-profit':'text-loss')}>{s.winRate.toFixed(1)}%</td>
                  <td className={cn('px-3 py-3 font-mono font-semibold text-[13px]', s.totalPnl>=0?'text-profit':'text-loss')}>{s.totalPnl>=0?'+':''}{s.totalPnl.toFixed(2)}</td>
                  <td className={cn('px-3 py-3 font-mono text-[12px]', s.avgRMultiple>=0?'text-profit':'text-loss')}>{s.avgRMultiple>=0?'+':''}{s.avgRMultiple.toFixed(2)}R</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  )
}
