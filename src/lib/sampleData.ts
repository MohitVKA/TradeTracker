import { Trade, JournalEntry } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { calculateTrade } from './calculations'

export function generateSampleData(): { trades: Trade[]; journal: JournalEntry[] } {
  const assets = ['BTC/USD', 'ETH/USD', 'AAPL', 'TSLA', 'SPY', 'QQQ', 'NQ', 'ES']
  const strategies = ['Breakout', 'Mean Reversion', 'Trend Follow', 'Scalp', 'Swing']
  const emotions = ['Calm', 'Neutral', 'Confident', 'Anxious', 'Very Calm'] as const

  const trades: Trade[] = []
  let date = new Date('2024-01-15')

  for (let i = 0; i < 40; i++) {
    date = new Date(date.getTime() + Math.random() * 3 * 86400000)
    const asset = assets[Math.floor(Math.random() * assets.length)]
    const tradeType = Math.random() > 0.5 ? 'Long' : 'Short'
    const strategy = strategies[Math.floor(Math.random() * strategies.length)]
    const entryPrice = 100 + Math.random() * 400
    const direction = tradeType === 'Long' ? 1 : -1
    const stopLoss = entryPrice - direction * (entryPrice * (0.01 + Math.random() * 0.02))
    const takeProfit = entryPrice + direction * (entryPrice * (0.02 + Math.random() * 0.05))
    const exitPrice = Math.random() > 0.45
      ? entryPrice + direction * (entryPrice * (0.015 + Math.random() * 0.04))
      : entryPrice - direction * (entryPrice * 0.01 + Math.random() * 0.015)
    const positionSize = 1 + Math.floor(Math.random() * 10)
    const fees = 2 + Math.random() * 8
    const emotion = emotions[Math.floor(Math.random() * emotions.length)]

    const { pnl, rMultiple, riskReward, result } = calculateTrade(
      entryPrice, exitPrice, positionSize, stopLoss, takeProfit, fees, tradeType
    )

    const now = new Date().toISOString()
    trades.push({
      id: uuidv4(),
      date: date.toISOString().split('T')[0],
      asset, tradeType, strategy,
      entryPrice: parseFloat(entryPrice.toFixed(2)),
      exitPrice: parseFloat(exitPrice.toFixed(2)),
      positionSize, stopLoss: parseFloat(stopLoss.toFixed(2)),
      takeProfit: parseFloat(takeProfit.toFixed(2)),
      fees: parseFloat(fees.toFixed(2)),
      notes: '',
      emotionBefore: emotion,
      pnl: parseFloat(pnl.toFixed(2)),
      rMultiple: parseFloat(rMultiple.toFixed(2)),
      riskReward: parseFloat(riskReward.toFixed(2)),
      result,
      createdAt: now,
      updatedAt: now,
    })
  }

  const journal: JournalEntry[] = [
    {
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      emotion: 'Calm',
      mistakes: 'Entered too early before confirmation',
      lessons: 'Wait for the close of the candle before entering',
      notes: 'Good session overall, followed the plan on most trades',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]

  return { trades, journal }
}
