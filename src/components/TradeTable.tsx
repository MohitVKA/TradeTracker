'use client'

import { useState } from 'react'
import { Trade } from '@/types'
import { cn } from '@/lib/utils'
import { ArrowUpDown, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

interface TradeTableProps {
  trades: Trade[]
  onEdit?: (trade: Trade) => void
  onDelete?: (id: string) => void
}

type SortKey = keyof Trade
type SortDir = 'asc' | 'desc'

export function TradeTable({ trades, onEdit, onDelete }: TradeTableProps) {
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

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-30" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />
  }

  const thCls = 'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none'

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary/50">
          <tr>
            {[
              { key: 'date', label: 'Date' },
              { key: 'asset', label: 'Asset' },
              { key: 'tradeType', label: 'Type' },
              { key: 'strategy', label: 'Strategy' },
              { key: 'entryPrice', label: 'Entry' },
              { key: 'exitPrice', label: 'Exit' },
              { key: 'pnl', label: 'PnL' },
              { key: 'rMultiple', label: 'R' },
              { key: 'result', label: 'Result' },
            ].map(({ key, label }) => (
              <th key={key} className={thCls} onClick={() => handleSort(key as SortKey)}>
                <div className="flex items-center gap-1.5">
                  {label}
                  <SortIcon col={key as SortKey} />
                </div>
              </th>
            ))}
            {(onEdit || onDelete) && <th className={thCls}>Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground text-sm">
                No trades found
              </td>
            </tr>
          ) : sorted.map((trade) => (
            <tr key={trade.id} className="hover:bg-secondary/30 transition-colors group">
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{trade.date}</td>
              <td className="px-4 py-3 font-semibold text-foreground">{trade.asset}</td>
              <td className="px-4 py-3">
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  trade.tradeType === 'Long' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                )}>
                  {trade.tradeType}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{trade.strategy}</td>
              <td className="px-4 py-3 font-mono text-xs">{trade.entryPrice.toFixed(2)}</td>
              <td className="px-4 py-3 font-mono text-xs">{trade.exitPrice.toFixed(2)}</td>
              <td className={cn('px-4 py-3 font-mono font-semibold text-sm',
                trade.pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
              </td>
              <td className={cn('px-4 py-3 font-mono text-xs',
                trade.rMultiple >= 0 ? 'text-green-400' : 'text-red-400')}>
                {trade.rMultiple >= 0 ? '+' : ''}{trade.rMultiple.toFixed(2)}R
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  trade.result === 'Win' ? 'bg-green-500/10 text-green-400' :
                  trade.result === 'Loss' ? 'bg-red-500/10 text-red-400' :
                  'bg-yellow-500/10 text-yellow-400'
                )}>
                  {trade.result}
                </span>
              </td>
              {(onEdit || onDelete) && (
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button onClick={() => onEdit(trade)}
                        className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(trade.id)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
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
  )
}
