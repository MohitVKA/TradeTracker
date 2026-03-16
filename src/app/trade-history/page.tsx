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

type R = 'All' | 'Win' | 'Loss' | 'Breakeven'
type T = 'All' | 'Long' | 'Short'

export default function TradeHistoryPage() {
  const [trades,      setTrades]       = useState<Trade[]>([])
  const [loaded,      setLoaded]       = useState(false)
  const [search,      setSearch]       = useState('')
  const [fResult,     setFResult]      = useState<R>('All')
  const [fType,       setFType]        = useState<T>('All')
  const [editing,     setEditing]      = useState<Trade | null>(null)

  useEffect(() => { setTrades(getTrades()); setLoaded(true) }, [])
  const reload = () => setTrades(getTrades())

  const filtered = trades.filter(t => {
    const q = search.toLowerCase()
    return (
      (!q || t.asset.toLowerCase().includes(q) || t.strategy.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q)) &&
      (fResult === 'All' || t.result    === fResult) &&
      (fType   === 'All' || t.tradeType === fType)
    )
  })

  const filterPill = (label: string, active: boolean, color: 'profit' | 'loss' | 'none', onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      className={cn(
        'btn btn-sm rounded-full',
        active
          ? color === 'profit' ? '!bg-[hsl(var(--profit))] !text-white !border-[hsl(var(--profit))]'
          : color === 'loss'   ? '!bg-[hsl(var(--loss))] !text-white !border-[hsl(var(--loss))]'
          : 'btn-primary'
          : 'btn-secondary',
      )}
    >
      {label}
    </button>
  )

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--fg-subtle))] pointer-events-none" />
          <input
            placeholder="Search asset, strategy, notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input w-full"
            style={{ paddingLeft: 36 }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 btn btn-ghost btn-icon"
              style={{ width: 20, height: 20 }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Result filter */}
        <div className="flex gap-1 flex-wrap">
          {(['All','Win','Loss','Breakeven'] as R[]).map(r =>
            filterPill(r, fResult === r, r === 'Win' ? 'profit' : r === 'Loss' ? 'loss' : 'none', () => setFResult(r))
          )}
        </div>

        {/* Type filter */}
        <div className="flex gap-1">
          {(['All','Long','Short'] as T[]).map(t =>
            filterPill(t, fType === t, t === 'Long' ? 'profit' : t === 'Short' ? 'loss' : 'none', () => setFType(t))
          )}
        </div>

        {/* Export */}
        <button onClick={() => exportTradesToCSV(filtered)} className="btn btn-secondary shrink-0">
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      <p className="text-[12px] text-[hsl(var(--fg-muted))] mb-3">
        {filtered.length} of {trades.length} trade{trades.length !== 1 ? 's' : ''}
      </p>

      <TradeTable trades={filtered} onEdit={setEditing} onDelete={id => { if (confirm('Delete this trade?')) { deleteTrade(id); reload() } }} loading={!loaded} />

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[3px] p-4">
          <div className="card p-5 md:p-6 w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[14px] font-semibold">Edit Trade</span>
              <button onClick={() => setEditing(null)} className="btn btn-ghost btn-icon"><X className="w-4 h-4" /></button>
            </div>
            <TradeForm initial={editing} onSubmit={t => { updateTrade(t); setEditing(null); reload() }} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}

      <FloatingActionButton />
    </PageWrapper>
  )
}
