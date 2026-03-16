'use client'

import { useState } from 'react'
import { Trade } from '@/types'
import { cn } from '@/lib/utils'
import { ArrowUpDown, ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { TradeCard } from './TradeCard'

interface TradeTableProps {
  trades:    Trade[]
  onEdit?:   (t: Trade) => void
  onDelete?: (id: string) => void
  loading?:  boolean
}

type SortKey = keyof Trade
type SortDir = 'asc' | 'desc'

const COLS = [
  { key: 'date',       label: 'Date'     },
  { key: 'asset',      label: 'Asset'    },
  { key: 'tradeType',  label: 'Side'     },
  { key: 'strategy',   label: 'Strategy' },
  { key: 'entryPrice', label: 'Entry'    },
  { key: 'exitPrice',  label: 'Exit'     },
  { key: 'pnl',        label: 'PnL'      },
  { key: 'rMultiple',  label: 'R'        },
  { key: 'result',     label: 'Result'   },
] as const

export function TradeTable({ trades, onEdit, onDelete, loading = false }: TradeTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(k: SortKey) {
    if (k === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir('desc') }
  }

  const sorted = [...trades].sort((a, b) => {
    const av = a[sortKey] as string | number
    const bv = b[sortKey] as string | number
    const c  = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? c : -c
  })

  function SortIcon({ col }: { col: string }) {
    if (col !== sortKey) return <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />
    return sortDir === 'asc'
      ? <ChevronUp   className="w-2.5 h-2.5 text-[hsl(var(--fg))]" />
      : <ChevronDown className="w-2.5 h-2.5 text-[hsl(var(--fg))]" />
  }

  /* Loading skeleton */
  if (loading) return (
    <div className="card overflow-hidden">
      <div className="border-b border-[hsl(var(--border))] px-4 py-3 flex gap-6 bg-[hsl(var(--bg-subtle))]">
        {[50,70,40,80,55,55,60,40,55].map((w,i) => (
          <div key={i} className="skeleton h-2.5 rounded" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_,i) => (
        <div key={i} className="border-b border-[hsl(var(--border))] last:border-0 px-4 py-3.5 flex gap-6">
          {[50,70,40,80,55,55,60,40,55].map((w,j) => (
            <div key={j} className="skeleton h-2.5 rounded" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <>
      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {sorted.length === 0
          ? <Empty />
          : sorted.map(t => <TradeCard key={t.id} trade={t} onEdit={onEdit} onDelete={onDelete} />)
        }
      </div>

      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-subtle))]">
                {COLS.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key as SortKey)}
                    className="px-4 py-2.5 text-left font-medium text-[hsl(var(--fg-muted))] text-[11px] uppercase tracking-[0.07em] cursor-pointer hover:text-[hsl(var(--fg))] transition-colors select-none whitespace-nowrap"
                  >
                    <span className="inline-flex items-center gap-1">
                      {label} <SortIcon col={key} />
                    </span>
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[hsl(var(--fg-muted))] uppercase tracking-[0.07em]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {sorted.length === 0
                ? (
                  <tr>
                    <td colSpan={COLS.length + 1} className="px-4 py-14 text-center text-[hsl(var(--fg-muted))] text-sm">
                      No trades found
                    </td>
                  </tr>
                )
                : sorted.map(trade => (
                  <tr
                    key={trade.id}
                    className="group hover:bg-[hsl(var(--bg-overlay))] transition-colors duration-100"
                  >
                    <td className="px-4 py-3 font-mono text-[12px] text-[hsl(var(--fg-muted))] whitespace-nowrap">
                      {trade.date}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[hsl(var(--fg))] whitespace-nowrap">
                      {trade.asset}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('badge', trade.tradeType === 'Long' ? 'badge-profit' : 'badge-loss')}>
                        {trade.tradeType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[hsl(var(--fg-muted))] whitespace-nowrap">
                      {trade.strategy}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[hsl(var(--fg))] whitespace-nowrap">
                      {trade.entryPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[hsl(var(--fg))] whitespace-nowrap">
                      {trade.exitPrice.toFixed(2)}
                    </td>
                    <td className={cn(
                      'px-4 py-3 font-mono font-semibold text-[13px] whitespace-nowrap',
                      trade.pnl >= 0 ? 'text-profit' : 'text-loss',
                    )}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                    </td>
                    <td className={cn(
                      'px-4 py-3 font-mono text-[12px] whitespace-nowrap',
                      trade.rMultiple >= 0 ? 'text-profit' : 'text-loss',
                    )}>
                      {trade.rMultiple >= 0 ? '+' : ''}{trade.rMultiple.toFixed(2)}R
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'badge',
                        trade.result === 'Win'  ? 'badge-profit' :
                        trade.result === 'Loss' ? 'badge-loss'   : 'badge-neutral',
                      )}>
                        {trade.result}
                      </span>
                    </td>
                    {(onEdit || onDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(trade)}
                              className="btn btn-ghost btn-icon btn-sm"
                              aria-label="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(trade.id)}
                              className="btn btn-ghost btn-icon btn-sm hover:text-[hsl(var(--loss))]"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function Empty() {
  return (
    <div className="card py-14 text-center text-[hsl(var(--fg-muted))] text-sm">
      No trades found
    </div>
  )
}
