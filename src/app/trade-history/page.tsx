'use client'

import { useEffect, useState } from 'react'
import { Trade } from '@/types'
import { getTrades, deleteTrade, updateTrade, exportTradesToCSV } from '@/lib/storage'
import { TradeTable } from '@/components/TradeTable'
import { TradeForm } from '@/components/forms/TradeForm'
import { BookOpen, Download, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TradeHistoryPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [search, setSearch] = useState('')
  const [filterResult, setFilterResult] = useState<'All' | 'Win' | 'Loss' | 'Breakeven'>('All')
  const [filterType, setFilterType] = useState<'All' | 'Long' | 'Short'>('All')
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)

  useEffect(() => {
    setTrades(getTrades())
  }, [])

  const reload = () => setTrades(getTrades())

  const handleDelete = (id: string) => {
    if (!confirm('Delete this trade?')) return
    deleteTrade(id)
    reload()
  }

  const handleEdit = (trade: Trade) => setEditingTrade(trade)

  const handleUpdate = (updated: Trade) => {
    updateTrade(updated)
    setEditingTrade(null)
    reload()
  }

  const filtered = trades.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !q || t.asset.toLowerCase().includes(q) ||
      t.strategy.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q)
    const matchResult = filterResult === 'All' || t.result === filterResult
    const matchType = filterType === 'All' || t.tradeType === filterType
    return matchSearch && matchResult && matchType
  })

  const inputCls = 'bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all'

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Trade History</h1>
            <p className="text-muted-foreground text-sm">{filtered.length} of {trades.length} trades</p>
          </div>
        </div>
        <button
          onClick={() => exportTradesToCSV(filtered)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border text-sm font-medium text-foreground hover:bg-secondary/80 transition-all"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search asset, strategy, notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={cn(inputCls, 'pl-9 w-full')}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-1 bg-secondary border border-border rounded-lg p-1">
          {(['All', 'Win', 'Loss', 'Breakeven'] as const).map(r => (
            <button key={r} onClick={() => setFilterResult(r)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                filterResult === r
                  ? r === 'Win' ? 'bg-green-500/15 text-green-400' :
                    r === 'Loss' ? 'bg-red-500/15 text-red-400' :
                    'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}>
              {r}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-secondary border border-border rounded-lg p-1">
          {(['All', 'Long', 'Short'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                filterType === t
                  ? t === 'Long' ? 'bg-green-500/15 text-green-400' :
                    t === 'Short' ? 'bg-red-500/15 text-red-400' :
                    'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Edit Trade</h2>
              <button onClick={() => setEditingTrade(null)}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <TradeForm
              initial={editingTrade}
              onSubmit={handleUpdate}
              onCancel={() => setEditingTrade(null)}
            />
          </div>
        </div>
      )}

      <TradeTable trades={filtered} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  )
}
