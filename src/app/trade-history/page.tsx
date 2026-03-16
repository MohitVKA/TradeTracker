'use client'

import { useEffect, useState } from 'react'
import { Trade } from '@/types'
import { getTrades, deleteTrade, updateTrade, exportTradesToCSV } from '@/lib/storage'
import { TradeTable } from '@/components/TradeTable'
import { TradeForm } from '@/components/forms/TradeForm'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { Download, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ResultFilter = 'All' | 'Win' | 'Loss' | 'Breakeven'
type TypeFilter   = 'All' | 'Long' | 'Short'

export default function TradeHistoryPage() {
  const [trades, setTrades]         = useState<Trade[]>([])
  const [loaded, setLoaded]         = useState(false)
  const [search, setSearch]         = useState('')
  const [filterResult, setFilterResult] = useState<ResultFilter>('All')
  const [filterType, setFilterType] = useState<TypeFilter>('All')
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)

  useEffect(() => {
    setTrades(getTrades())
    setLoaded(true)
  }, [])

  const reload = () => setTrades(getTrades())

  const handleDelete = (id: string) => {
    if (!confirm('Delete this trade?')) return
    deleteTrade(id)
    reload()
  }

  const handleUpdate = (updated: Trade) => {
    updateTrade(updated)
    setEditingTrade(null)
    reload()
  }

  const filtered = trades.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      t.asset.toLowerCase().includes(q) ||
      t.strategy.toLowerCase().includes(q) ||
      t.notes.toLowerCase().includes(q)
    const matchResult = filterResult === 'All' || t.result === filterResult
    const matchType   = filterType   === 'All' || t.tradeType === filterType
    return matchSearch && matchResult && matchType
  })

  const inputCls = 'bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all'

  return (
    <PageWrapper>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            placeholder="Search asset, strategy, notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={cn(inputCls, 'pl-9 w-full')}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Result filter pills */}
        <div className="flex gap-1 bg-secondary border border-border rounded-md p-1 shrink-0">
          {(['All', 'Win', 'Loss', 'Breakeven'] as ResultFilter[]).map(r => (
            <button
              key={r}
              onClick={() => setFilterResult(r)}
              className={cn(
                'px-2.5 py-1 rounded-sm text-xs font-medium transition-all duration-100',
                filterResult === r
                  ? r === 'Win'  ? 'bg-profit-subtle text-profit'
                  : r === 'Loss' ? 'bg-loss-subtle text-loss'
                  : 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Type filter pills */}
        <div className="flex gap-1 bg-secondary border border-border rounded-md p-1 shrink-0">
          {(['All', 'Long', 'Short'] as TypeFilter[]).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                'px-2.5 py-1 rounded-sm text-xs font-medium transition-all duration-100',
                filterType === t
                  ? t === 'Long'  ? 'bg-profit-subtle text-profit'
                  : t === 'Short' ? 'bg-loss-subtle text-loss'
                  : 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Export */}
        <button
          onClick={() => exportTradesToCSV(filtered)}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-card border border-border text-sm font-medium text-foreground hover:bg-accent transition-all btn-press shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground mb-3">
        {filtered.length} of {trades.length} trade{trades.length !== 1 ? 's' : ''}
      </p>

      <TradeTable
        trades={filtered}
        onEdit={setEditingTrade}
        onDelete={handleDelete}
        loading={!loaded}
      />

      {/* Edit modal */}
      {editingTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[3px] p-4">
          <div className="bg-card border border-border rounded-xl p-5 md:p-6 w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Edit Trade</h2>
              <button
                onClick={() => setEditingTrade(null)}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
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

      <FloatingActionButton />
    </PageWrapper>
  )
}
