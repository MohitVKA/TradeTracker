'use client'

import { Trade } from '@/types'
import { cn } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'

interface TradeCardProps {
  trade: Trade
  onEdit?: (trade: Trade) => void
  onDelete?: (id: string) => void
}

export function TradeCard({ trade, onEdit, onDelete }: TradeCardProps) {
  const isProfit = trade.pnl >= 0

  return (
    <div className={cn(
      'rounded-lg border bg-card p-4 transition-all duration-150',
      'shadow-card hover:shadow-card-hover card-hover',
      isProfit ? 'border-l-2 border-l-profit border-border' : 'border-l-2 border-l-loss border-border'
    )}>
      {/* Row 1: Asset + PnL */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground text-base">{trade.asset}</span>
          <span className={cn(
            'inline-block px-1.5 py-0.5 rounded text-[11px] font-medium',
            trade.tradeType === 'Long' ? 'bg-profit-subtle text-profit' : 'bg-loss-subtle text-loss'
          )}>
            {trade.tradeType}
          </span>
        </div>
        <div className={cn(
          'text-base font-semibold font-mono',
          isProfit ? 'text-profit' : 'text-loss'
        )}>
          {isProfit ? '+' : ''}{trade.pnl.toFixed(2)}
        </div>
      </div>

      {/* Row 2: Stats grid */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs mb-3">
        <div>
          <div className="text-muted-foreground mb-0.5">Entry</div>
          <div className="font-mono text-foreground">{trade.entryPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-muted-foreground mb-0.5">Exit</div>
          <div className="font-mono text-foreground">{trade.exitPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-muted-foreground mb-0.5">R Multiple</div>
          <div className={cn('font-mono font-medium', isProfit ? 'text-profit' : 'text-loss')}>
            {trade.rMultiple >= 0 ? '+' : ''}{trade.rMultiple.toFixed(2)}R
          </div>
        </div>
        <div>
          <div className="text-muted-foreground mb-0.5">Strategy</div>
          <div className="text-foreground truncate">{trade.strategy}</div>
        </div>
        <div>
          <div className="text-muted-foreground mb-0.5">Date</div>
          <div className="font-mono text-foreground">{trade.date}</div>
        </div>
        <div>
          <div className="text-muted-foreground mb-0.5">Result</div>
          <span className={cn(
            'inline-block px-1.5 py-0.5 rounded text-[11px] font-medium',
            trade.result === 'Win'  ? 'bg-profit-subtle text-profit' :
            trade.result === 'Loss' ? 'bg-loss-subtle text-loss' :
            'bg-secondary text-muted-foreground'
          )}>
            {trade.result}
          </span>
        </div>
      </div>

      {/* Row 3: Actions */}
      {(onEdit || onDelete) && (
        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/60">
          {onEdit && (
            <button
              onClick={() => onEdit(trade)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(trade.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-loss hover:bg-loss-subtle transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
