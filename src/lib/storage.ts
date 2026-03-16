import { Trade, JournalEntry } from '@/types'

const TRADES_KEY = 'trading_journal_trades'
const JOURNAL_KEY = 'trading_journal_entries'

// ---- Trades ----
export function getTrades(): Trade[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(TRADES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveTrades(trades: Trade[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades))
}

export function addTrade(trade: Trade): void {
  const trades = getTrades()
  trades.unshift(trade)
  saveTrades(trades)
}

export function updateTrade(updatedTrade: Trade): void {
  const trades = getTrades()
  const idx = trades.findIndex(t => t.id === updatedTrade.id)
  if (idx !== -1) {
    trades[idx] = updatedTrade
    saveTrades(trades)
  }
}

export function deleteTrade(id: string): void {
  const trades = getTrades().filter(t => t.id !== id)
  saveTrades(trades)
}

// ---- Journal ----
export function getJournalEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(JOURNAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveJournalEntries(entries: JournalEntry[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries))
}

export function addJournalEntry(entry: JournalEntry): void {
  const entries = getJournalEntries()
  entries.unshift(entry)
  saveJournalEntries(entries)
}

export function updateJournalEntry(updated: JournalEntry): void {
  const entries = getJournalEntries()
  const idx = entries.findIndex(e => e.id === updated.id)
  if (idx !== -1) {
    entries[idx] = updated
    saveJournalEntries(entries)
  }
}

export function deleteJournalEntry(id: string): void {
  const entries = getJournalEntries().filter(e => e.id !== id)
  saveJournalEntries(entries)
}

// ---- CSV Export ----
export function exportTradesToCSV(trades: Trade[]): void {
  const headers = [
    'Date', 'Asset', 'Type', 'Strategy', 'Entry', 'Exit',
    'Size', 'Stop Loss', 'Take Profit', 'Fees',
    'PnL', 'R Multiple', 'Risk/Reward', 'Result',
    'Emotion', 'Notes'
  ]
  const rows = trades.map(t => [
    t.date, t.asset, t.tradeType, t.strategy,
    t.entryPrice, t.exitPrice, t.positionSize,
    t.stopLoss, t.takeProfit, t.fees,
    t.pnl.toFixed(2), t.rMultiple.toFixed(2), t.riskReward.toFixed(2),
    t.result, t.emotionBefore,
    `"${t.notes.replace(/"/g, '""')}"`
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `trades_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
