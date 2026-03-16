import { Trade, DashboardStats, EquityPoint, StrategyStats, TradeResult } from '@/types'

export function calculateTrade(
  entryPrice: number,
  exitPrice: number,
  positionSize: number,
  stopLoss: number,
  takeProfit: number,
  fees: number,
  tradeType: 'Long' | 'Short'
): { pnl: number; rMultiple: number; riskReward: number; result: TradeResult } {
  let pnl: number
  if (tradeType === 'Long') {
    pnl = (exitPrice - entryPrice) * positionSize - fees
  } else {
    pnl = (entryPrice - exitPrice) * positionSize - fees
  }

  const risk = Math.abs(entryPrice - stopLoss) * positionSize
  const reward = Math.abs(takeProfit - entryPrice) * positionSize
  const riskReward = risk > 0 ? reward / risk : 0

  const rMultiple = risk > 0 ? pnl / risk : 0

  const result: TradeResult =
    pnl > 0.001 ? 'Win' : pnl < -0.001 ? 'Loss' : 'Breakeven'

  return { pnl, rMultiple, riskReward, result }
}

export function computeDashboardStats(trades: Trade[]): DashboardStats {
  if (trades.length === 0) {
    return {
      totalPnl: 0, winRate: 0, totalTrades: 0, avgRMultiple: 0,
      totalWins: 0, totalLosses: 0, bestTrade: 0, worstTrade: 0,
      avgWin: 0, avgLoss: 0, profitFactor: 0, maxDrawdown: 0,
    }
  }

  const wins = trades.filter(t => t.result === 'Win')
  const losses = trades.filter(t => t.result === 'Loss')
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0)
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0
  const avgRMultiple = trades.reduce((s, t) => s + t.rMultiple, 0) / trades.length
  const bestTrade = Math.max(...trades.map(t => t.pnl))
  const worstTrade = Math.min(...trades.map(t => t.pnl))
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0
  const totalGain = wins.reduce((s, t) => s + t.pnl, 0)
  const totalLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0))
  const profitFactor = totalLoss > 0 ? totalGain / totalLoss : totalGain > 0 ? 999 : 0

  // Max drawdown
  let peak = 0, maxDrawdown = 0, running = 0
  const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  for (const t of sorted) {
    running += t.pnl
    if (running > peak) peak = running
    const dd = peak - running
    if (dd > maxDrawdown) maxDrawdown = dd
  }

  return {
    totalPnl, winRate, totalTrades: trades.length,
    avgRMultiple, totalWins: wins.length, totalLosses: losses.length,
    bestTrade, worstTrade, avgWin, avgLoss, profitFactor, maxDrawdown,
  }
}

export function buildEquityCurve(trades: Trade[]): EquityPoint[] {
  const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  let running = 0
  const points: EquityPoint[] = [{ date: 'Start', equity: 0, pnl: 0, tradeCount: 0 }]
  sorted.forEach((t, i) => {
    running += t.pnl
    points.push({
      date: t.date,
      equity: parseFloat(running.toFixed(2)),
      pnl: parseFloat(t.pnl.toFixed(2)),
      tradeCount: i + 1,
    })
  })
  return points
}

export function buildStrategyStats(trades: Trade[]): StrategyStats[] {
  const map = new Map<string, Trade[]>()
  for (const t of trades) {
    const list = map.get(t.strategy) || []
    list.push(t)
    map.set(t.strategy, list)
  }
  return Array.from(map.entries()).map(([strategy, ts]) => {
    const wins = ts.filter(t => t.result === 'Win').length
    return {
      strategy,
      totalPnl: ts.reduce((s, t) => s + t.pnl, 0),
      winRate: (wins / ts.length) * 100,
      trades: ts.length,
      avgRMultiple: ts.reduce((s, t) => s + t.rMultiple, 0) / ts.length,
    }
  }).sort((a, b) => b.totalPnl - a.totalPnl)
}

export function formatCurrency(val: number, prefix = '$'): string {
  const abs = Math.abs(val)
  const formatted = abs >= 1000
    ? (abs / 1000).toFixed(1) + 'k'
    : abs.toFixed(2)
  return `${val < 0 ? '-' : ''}${prefix}${formatted}`
}

export function formatPct(val: number): string {
  return `${val.toFixed(1)}%`
}
