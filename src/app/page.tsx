'use client'

import { useEffect, useState } from 'react'
import { Trade } from '@/types'
import { getTrades, saveTrades } from '@/lib/storage'
import { computeDashboardStats, buildEquityCurve, formatCurrency, formatPct } from '@/lib/calculations'
import { generateSampleData } from '@/lib/sampleData'
import { StatsCard } from '@/components/StatsCard'
import { EquityChart } from '@/components/charts/EquityChart'
import { TradeTable } from '@/components/TradeTable'
import {
  TrendingUp, TrendingDown, Activity, Target,
  Zap, Award, AlertTriangle, BarChart2, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

  if (!loaded) return null

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {trades.length > 0
              ? `${trades.length} trades logged`
              : 'Welcome — start logging your trades'}
          </p>
        </div>
        {trades.length === 0 && (
          <button onClick={loadSample}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/15 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-all">
            <Sparkles className="w-4 h-4" />
            Load Sample Data
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total PnL"
          value={formatCurrency(stats.totalPnl)}
          subtitle={`${stats.totalTrades} trades`}
          icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
          valueColor={stats.totalPnl >= 0 ? 'profit' : 'loss'}
          trend={stats.totalPnl >= 0 ? 'up' : 'down'}
          trendValue={stats.totalPnl >= 0 ? '▲' : '▼'}
        />
        <StatsCard
          title="Win Rate"
          value={formatPct(stats.winRate)}
          subtitle={`${stats.totalWins}W / ${stats.totalLosses}L`}
          icon={Activity}
          valueColor={stats.winRate >= 50 ? 'profit' : 'loss'}
        />
        <StatsCard
          title="Avg R Multiple"
          value={`${stats.avgRMultiple >= 0 ? '+' : ''}${stats.avgRMultiple.toFixed(2)}R`}
          subtitle="per trade"
          icon={Target}
          valueColor={stats.avgRMultiple >= 0 ? 'profit' : 'loss'}
        />
        <StatsCard
          title="Profit Factor"
          value={stats.profitFactor >= 999 ? '∞' : stats.profitFactor.toFixed(2)}
          subtitle="gross profit / loss"
          icon={Zap}
          valueColor={stats.profitFactor >= 1 ? 'profit' : 'loss'}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Best Trade"
          value={formatCurrency(stats.bestTrade)}
          icon={Award}
          valueColor="profit"
        />
        <StatsCard
          title="Worst Trade"
          value={formatCurrency(stats.worstTrade)}
          icon={AlertTriangle}
          valueColor="loss"
        />
        <StatsCard
          title="Avg Win"
          value={formatCurrency(stats.avgWin)}
          icon={TrendingUp}
          valueColor="profit"
        />
        <StatsCard
          title="Max Drawdown"
          value={formatCurrency(stats.maxDrawdown)}
          icon={BarChart2}
          valueColor={stats.maxDrawdown > 0 ? 'loss' : 'default'}
        />
      </div>

      {/* Equity Curve */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-foreground">Equity Curve</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Cumulative PnL over time</p>
          </div>
          <div className={cn(
            'text-sm font-mono font-bold px-3 py-1 rounded-lg',
            stats.totalPnl >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          )}>
            {stats.totalPnl >= 0 ? '+' : ''}{stats.totalPnl.toFixed(2)}
          </div>
        </div>
        <EquityChart data={equityData} height={220} />
      </div>

      {/* Recent Trades */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Recent Trades</h2>
          <a href="/trade-history" className="text-xs text-primary hover:text-primary/80 transition-colors">
            View all →
          </a>
        </div>
        <TradeTable trades={recentTrades} />
      </div>
    </div>
  )
}
