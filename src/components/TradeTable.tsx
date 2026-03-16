'use client'

import { useState } from 'react'
import { Trade } from '@/types'
import { cn } from '@/lib/utils'
import { ArrowUpDown, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { TradeCard } from './TradeCard'

interface TradeTableProps {
  trades: Trade[]
  onEdit?: (trade: Trade) => void
  onDelete?: (id: string) => void
  loading?: boolean
}

type SortKey = keyof Trade
type SortDir = 'asc' | 'desc'

const COLUMNS = [
  { key: 'date',       label: 'Date' },
  { key: 'asset',      label: 'Asset' },
  { key: 'tradeType',  label: 'Type' },
  { key: 'strategy',   label: 'Strategy' },
  { key: 'entryPrice', label: 'Entry' },
  { key: 'exitPrice',  label: 'Exit' },
  { key: 'pnl',        label: 'PnL' },
  { key: 'rMultiple',  label: 'R' },
  { key: 'result',     label: 'Result' },
] as const

export function TradeTable({ trades, onEdit, onDelete, loading = false }: TradeTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...trades].sort((a, b) => {
    const av = a[sortKey] as string | number
    const bv = b[sortKey] as string | number
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  function SortIcon({ col }: { col: string }) {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-25" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="bg-secondary/60 px-4 py-3 hidden md:flex gap-4 border-b border-border">
          {[60,80,50,90,60,60,70,50,60].map((w,i) => (
            <div key={i} className="skeleton h-3 rounded" style={{width:w}} />
          ))}
        </div>
        {Array.from({length:5}).map((_,i) => (
          <div key={i} className="px-4 py-4 flex gap-4 border-b border-border last:border-0">
            {[60,80,50,90,60,60,70,50,60].map((w,j) => (
              <div key={j} className="skeleton h-3 rounded" style={{width:w}} />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* ── Mobile: stacked cards ── */}
      <div className="md:hidden space-y-2">
        {sorted.length === 0 ? (
          <div className="rounded-lg border border-border bg-card py-12 text-center text-muted-foreground text-sm">
            No trades found
          </div>
        ) : sorted.map(trade => (
          <TradeCard
            key={trade.id}
            trade={trade}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* ── Desktop: table ── */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 sticky top-0 z-10">
            <tr>
              {COLUMNS.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key as SortKey)}
                  className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-[0.08em] cursor-pointer hover:text-foreground transition-colors select-none whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {label}
                    <SortIcon col={key} />
                  </span>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-[0.08em]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-4 py-14 text-center text-muted-foreground text-sm">
                  No trades found
                </td>
              </tr>
            ) : sorted.map((trade) => (
              <tr
                key={trade.id}
                className="hover:bg-accent/60 transition-colors duration-100 group"
              >
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{trade.date}</td>
                <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{trade.asset}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'inline-block px-1.5 py-0.5 rounded text-[11px] font-medium',
                    trade.tradeType === 'Long'
                      ? 'bg-profit-subtle text-profit'
                      : 'bg-loss-subtle text-loss'
                  )}>
                    {trade.tradeType}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{trade.strategy}</td>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{trade.entryPrice.toFixed(2)}</td>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{trade.exitPrice.toFixed(2)}</td>
                <td className={cn(
                  'px-4 py-3 font-mono font-semibold text-sm whitespace-nowrap',
                  trade.pnl >= 0 ? 'text-profit' : 'text-loss'
                )}>
                  {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                </td>
                <td className={cn(
                  'px-4 py-3 font-mono text-xs whitespace-nowrap',
                  trade.rMultiple >= 0 ? 'text-profit' : 'text-loss'
                )}>
                  {trade.rMultiple >= 0 ? '+' : ''}{trade.rMultiple.toFixed(2)}R
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'inline-block px-1.5 py-0.5 rounded text-[11px] font-medium',
                    trade.result === 'Win'       ? 'bg-profit-subtle text-profit' :
                    trade.result === 'Loss'      ? 'bg-loss-subtle text-loss' :
                    'bg-secondary text-muted-foreground'
                  )}>
                    {trade.result}
                  </span>
                </td>
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(trade)}
                          className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                          aria-label="Edit trade"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(trade.id)}
                          className="p-1.5 rounded hover:bg-loss-subtle text-muted-foreground hover:text-loss transition-colors"
                          aria-label="Delete trade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
