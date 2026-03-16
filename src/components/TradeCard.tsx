'use client'

import { Trade } from '@/types'
import { cn } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'

interface TradeCardProps {
  trade:     Trade
  onEdit?:   (t: Trade) => void
  onDelete?: (id: string) => void
}

export function TradeCard({ trade, onEdit, onDelete }: TradeCardProps) {
  const profit = trade.pnl >= 0

  return (
    <div
      className={cn(
        'card p-4 transition-all duration-150',
        'border-l-[2px]',
        profit ? 'border-l-[hsl(var(--profit))]' : 'border-l-[hsl(var(--loss))]',
      )}
    >
      {/* Row 1 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[hsl(var(--fg))] text-[15px] leading-none">{trade.asset}</span>
          <span className={cn('badge', trade.tradeType === 'Long' ? 'badge-profit' : 'badge-loss')}>
            {trade.tradeType}
          </span>
        </div>
        <span className={cn(
          'font-mono font-semibold text-[15px] leading-none',
          profit ? 'text-profit' : 'text-loss',
        )}>
          {profit ? '+' : ''}{trade.pnl.toFixed(2)}
        </span>
      </div>

      {/* Row 2 - stats */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-2.5 text-[12px]">
        {[
          { label: 'Entry',    val: trade.entryPrice.toFixed(2),   mono: true },
          { label: 'Exit',     val: trade.exitPrice.toFixed(2),    mono: true },
          {
            label: 'R',
            val: `${trade.rMultiple >= 0 ? '+' : ''}${trade.rMultiple.toFixed(2)}R`,
            mono: true,
            color: profit ? 'text-profit' : 'text-loss',
          },
          { label: 'Strategy', val: trade.strategy,                mono: false },
          { label: 'Date',     val: trade.date,                    mono: true },
          {
            label: 'Result',
            val: null,
            badge: trade.result,
          },
        ].map(({ label, val, mono, color, badge }) => (
          <div key={label}>
            <div className="text-[hsl(var(--fg-subtle))] mb-0.5">{label}</div>
            {badge
              ? <span className={cn('badge', badge === 'Win' ? 'badge-profit' : badge === 'Loss' ? 'badge-loss' : 'badge-neutral')}>{badge}</span>
              : <div className={cn(mono && 'font-mono', 'text-[hsl(var(--fg))]', color)}>{val}</div>
            }
          </div>
        ))}
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="flex items-center justify-end gap-1.5 mt-3 pt-3 border-t border-[hsl(var(--border))]">
          {onEdit && (
            <button onClick={() => onEdit(trade)} className="btn btn-secondary btn-sm gap-1.5">
              <Pencil className="w-3 h-3" /> Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(trade.id)} className="btn btn-danger btn-sm gap-1.5">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
