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
import {
  TrendingUp, TrendingDown, Activity, Target,
  Zap, Award, AlertTriangle, BarChart2, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTrades(getTrades())
    setLoaded(true)
  }, [])

  const stats = computeDashboardStats(trades)
  const equityData = buildEquityCurve(trades)
  const recentTrades = trades.slice(0, 8)

  const loadSample = () => {
    const { trades: sample, journal } = generateSampleData()
    saveTrades(sample)
    const { saveJournalEntries } = require('@/lib/storage')
    saveJournalEntries(journal)
    setTrades(sample)
  }

  return (
    <PageWrapper>
      {/* Welcome banner when empty */}
      {loaded && trades.length === 0 && (
        <div className="mb-6 rounded-lg border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-foreground mb-1">Welcome to TradeLog</div>
            <p className="text-sm text-muted-foreground">Start by logging your first trade, or load sample data to explore.</p>
          </div>
          <button
            onClick={loadSample}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/12 border border-primary/25 text-primary text-sm font-medium hover:bg-primary/18 transition-all btn-press whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4" />
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
          trendValue={stats.totalPnl >= 0 ? '+' : '-'}
          loading={!loaded}
        />
        <StatsCard
          title="Win Rate"
          value={formatPct(stats.winRate)}
          subtitle={`${stats.totalWins}W / ${stats.totalLosses}L`}
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

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatsCard title="Best Trade" value={formatCurrency(stats.bestTrade)} icon={Award} valueColor="profit" loading={!loaded} />
        <StatsCard title="Worst Trade" value={formatCurrency(stats.worstTrade)} icon={AlertTriangle} valueColor="loss" loading={!loaded} />
        <StatsCard title="Avg Win" value={formatCurrency(stats.avgWin)} icon={TrendingUp} valueColor="profit" loading={!loaded} />
        <StatsCard title="Max Drawdown" value={formatCurrency(stats.maxDrawdown)} icon={BarChart2} valueColor={stats.maxDrawdown > 0 ? 'loss' : 'default'} loading={!loaded} />
      </div>

      {/* Equity curve */}
      <div className="rounded-lg border border-border bg-card p-5 mb-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-foreground text-sm">Equity Curve</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Cumulative PnL over time</p>
          </div>
          {loaded && (
            <div className={cn(
              'text-sm font-mono font-semibold px-3 py-1 rounded-md',
              stats.totalPnl >= 0 ? 'bg-profit-subtle text-profit' : 'bg-loss-subtle text-loss'
            )}>
              {stats.totalPnl >= 0 ? '+' : ''}{stats.totalPnl.toFixed(2)}
            </div>
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
          <h2 className="font-semibold text-foreground text-sm">Recent Trades</h2>
          <Link href="/trade-history" className="text-xs text-primary hover:text-primary/80 transition-colors">
            View all →
          </Link>
        </div>
        <TradeTable trades={recentTrades} loading={!loaded} />
      </div>

      <FloatingActionButton />
    </PageWrapper>
  )
}
