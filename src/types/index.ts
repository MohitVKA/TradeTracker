export type TradeType = 'Long' | 'Short'
export type TradeResult = 'Win' | 'Loss' | 'Breakeven'
export type EmotionLevel = 'Very Calm' | 'Calm' | 'Neutral' | 'Anxious' | 'Very Anxious' | 'Fearful' | 'Greedy' | 'Confident' | 'Overconfident'

export interface Trade {
  id: string
  date: string
  asset: string
  tradeType: TradeType
  strategy: string
  entryPrice: number
  exitPrice: number
  positionSize: number
  stopLoss: number
  takeProfit: number
  fees: number
  notes: string
  emotionBefore: EmotionLevel
  screenshotUrl?: string
  // Calculated
  pnl: number
  rMultiple: number
  riskReward: number
  result: TradeResult
  createdAt: string
  updatedAt: string
}

export interface JournalEntry {
  id: string
  date: string
  emotion: EmotionLevel
  mistakes: string
  lessons: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalPnl: number
  winRate: number
  totalTrades: number
  avgRMultiple: number
  totalWins: number
  totalLosses: number
  bestTrade: number
  worstTrade: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  maxDrawdown: number
}

export interface EquityPoint {
  date: string
  equity: number
  pnl: number
  tradeCount: number
}

export interface StrategyStats {
  strategy: string
  totalPnl: number
  winRate: number
  trades: number
  avgRMultiple: number
}
