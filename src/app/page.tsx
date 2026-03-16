'use client'

import { useEffect, useState } from 'react'
import { Trade } from '@/types'
import { getTrades, saveTrades } from '@/lib/storage'
import { computeDashboardStats, buildEquityCurve, formatCurrency, formatPct } from '@/lib/calculations'
import { generateSampleData } from '@/lib/sampleData'
import { StatsCard } from '@/components/StatsCard'
import { EquityChart } from '@/components/charts/EquityChart'
import { TradeTable } from '@/components/TradeTable'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { TrendingUp, TrendingDown, Activity, Target, Zap, Award, AlertTriangle, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { setTrades(getTrades()); setLoaded(true) }, [])

  const stats      = computeDashboardStats(trades)
  const equityData = buildEquityCurve(trades)

  const loadSample = () => {
    const { trades: sample, journal } = generateSampleData()
    saveTrades(sample)
    const { saveJournalEntries } = require('@/lib/storage')
    saveJournalEntries(journal)
    setTrades(sample)
  }

  return (
    <PageWrapper>
      {/* Empty state banner */}
      {loaded && trades.length === 0 && (
        <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="font-semibold text-[hsl(var(--fg))] mb-0.5">Welcome to TradeLog</div>
            <p className="text-[13px] text-[hsl(var(--fg-muted))]">Start logging your trades or load sample data to explore.</p>
          </div>
          <button onClick={loadSample} className="btn btn-primary shrink-0" style={{ height: 34 }}>
            Load Sample Data
          </button>
        </div>
      )}

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <StatsCard
          title="Total PnL"
          value={formatCurrency(stats.totalPnl)}
          subtitle={`${stats.totalTrades} trades`}
          icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
          valueColor={stats.totalPnl >= 0 ? 'profit' : 'loss'}
          trend={stats.totalPnl >= 0 ? 'up' : 'down'}
          trendLabel={stats.totalPnl >= 0 ? 'Profit' : 'Loss'}
          loading={!loaded}
        />
        <StatsCard
          title="Win Rate"
          value={formatPct(stats.winRate)}
          subtitle={`${stats.totalWins}W  ${stats.totalLosses}L`}
          icon={Activity}
          valueColor={stats.winRate >= 50 ? 'profit' : stats.winRate > 0 ? 'loss' : 'default'}
          loading={!loaded}
        />
        <StatsCard
          title="Avg R Multiple"
          value={`${stats.avgRMultiple >= 0 ? '+' : ''}${stats.avgRMultiple.toFixed(2)}R`}
          subtitle="per trade"
          icon={Target}
          valueColor={stats.avgRMultiple >= 0 ? 'profit' : 'loss'}
          loading={!loaded}
        />
        <StatsCard
          title="Profit Factor"
          value={stats.profitFactor >= 999 ? '∞' : stats.profitFactor.toFixed(2)}
          subtitle="gross profit / loss"
          icon={Zap}
          valueColor={stats.profitFactor >= 1 ? 'profit' : stats.profitFactor > 0 ? 'loss' : 'default'}
          loading={!loaded}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatsCard title="Best Trade"    value={formatCurrency(stats.bestTrade)}  icon={Award}          valueColor="profit" loading={!loaded} />
        <StatsCard title="Worst Trade"   value={formatCurrency(stats.worstTrade)} icon={AlertTriangle}   valueColor="loss"   loading={!loaded} />
        <StatsCard title="Avg Win"       value={formatCurrency(stats.avgWin)}     icon={TrendingUp}      valueColor="profit" loading={!loaded} />
        <StatsCard title="Max Drawdown"  value={formatCurrency(stats.maxDrawdown)}icon={BarChart2}       valueColor={stats.maxDrawdown > 0 ? 'loss' : 'default'} loading={!loaded} />
      </div>

      {/* Equity curve */}
      <div className="card p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-[13px] text-[hsl(var(--fg))]">Equity Curve</div>
            <div className="text-[12px] text-[hsl(var(--fg-muted))] mt-0.5">Cumulative PnL over time</div>
          </div>
          {loaded && (
            <span className={cn(
              'badge',
              stats.totalPnl >= 0 ? 'badge-profit' : 'badge-loss',
            )}>
              {stats.totalPnl >= 0 ? '+' : ''}{stats.totalPnl.toFixed(2)}
            </span>
          )}
        </div>
        {!loaded
          ? <div className="skeleton w-full h-52 rounded-lg" />
          : <EquityChart data={equityData} height={220} />
        }
      </div>

      {/* Recent trades */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-semibold text-[hsl(var(--fg))]">Recent Trades</span>
          <Link href="/trade-history" className="text-[12px] text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))] transition-colors">
            View all →
          </Link>
        </div>
        <TradeTable trades={trades.slice(0, 8)} loading={!loaded} />
      </div>

      <FloatingActionButton />
    </PageWrapper>
  )
}
