'use client'

import { useState, useEffect } from 'react'
import { Trade, EmotionLevel } from '@/types'
import { calculateTrade } from '@/lib/calculations'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

interface TradeFormProps {
  initial?: Trade
  onSubmit: (trade: Trade) => void
  onCancel?: () => void
}

const EMOTIONS: EmotionLevel[] = [
  'Very Calm','Calm','Neutral','Confident','Overconfident',
  'Anxious','Very Anxious','Fearful','Greedy',
]
const STRATEGIES = ['Breakout','Mean Reversion','Trend Follow','Scalp','Swing','Momentum','News Play','Other']

export function TradeForm({ initial, onSubmit, onCancel }: TradeFormProps) {
  const [form, setForm] = useState({
    date:          new Date().toISOString().split('T')[0],
    asset:         '',
    tradeType:     'Long' as 'Long' | 'Short',
    strategy:      '',
    entryPrice:    '',
    exitPrice:     '',
    positionSize:  '',
    stopLoss:      '',
    takeProfit:    '',
    fees:          '0',
    notes:         '',
    emotionBefore: 'Neutral' as EmotionLevel,
  })

  const [preview, setPreview] = useState<{ pnl: number; rMultiple: number; riskReward: number } | null>(null)

  useEffect(() => {
    if (initial) {
      setForm({
        date: initial.date, asset: initial.asset, tradeType: initial.tradeType,
        strategy: initial.strategy, entryPrice: String(initial.entryPrice),
        exitPrice: String(initial.exitPrice), positionSize: String(initial.positionSize),
        stopLoss: String(initial.stopLoss), takeProfit: String(initial.takeProfit),
        fees: String(initial.fees), notes: initial.notes, emotionBefore: initial.emotionBefore,
      })
    }
  }, [initial])

  useEffect(() => {
    const ep = parseFloat(form.entryPrice), xp = parseFloat(form.exitPrice)
    const ps = parseFloat(form.positionSize), sl = parseFloat(form.stopLoss)
    const tp = parseFloat(form.takeProfit), f = parseFloat(form.fees) || 0
    if (ep && xp && ps && sl && tp) {
      setPreview(calculateTrade(ep, xp, ps, sl, tp, f, form.tradeType))
    } else {
      setPreview(null)
    }
  }, [form])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!preview) return
    const ep = parseFloat(form.entryPrice), xp = parseFloat(form.exitPrice)
    const ps = parseFloat(form.positionSize), sl = parseFloat(form.stopLoss)
    const tp = parseFloat(form.takeProfit), f = parseFloat(form.fees) || 0
    const { pnl, rMultiple, riskReward, result } = calculateTrade(ep, xp, ps, sl, tp, f, form.tradeType)
    const now = new Date().toISOString()
    onSubmit({
      id: initial?.id || uuidv4(),
      date: form.date, asset: form.asset, tradeType: form.tradeType,
      strategy: form.strategy, entryPrice: ep, exitPrice: xp, positionSize: ps,
      stopLoss: sl, takeProfit: tp, fees: f, notes: form.notes,
      emotionBefore: form.emotionBefore,
      pnl, rMultiple, riskReward, result,
      createdAt: initial?.createdAt || now,
      updatedAt: now,
    })
  }

  const label  = 'block text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-[0.1em]'
  const input  = 'w-full bg-secondary border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all font-mono'
  const select = 'w-full bg-secondary border border-border rounded-md px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className={label}>Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={input} required />
        </div>
        <div>
          <label className={label}>Asset</label>
          <input placeholder="BTC/USD, AAPL…" value={form.asset} onChange={e => set('asset', e.target.value)} className={input} required />
        </div>
        <div>
          <label className={label}>Direction</label>
          <div className="flex gap-1.5">
            {(['Long','Short'] as const).map(t => (
              <button key={t} type="button" onClick={() => set('tradeType', t)}
                className={cn(
                  'flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-150 border',
                  form.tradeType === t && t === 'Long'  ? 'bg-profit-subtle border-profit/40 text-profit' :
                  form.tradeType === t && t === 'Short' ? 'bg-loss-subtle border-loss/40 text-loss' :
                  'bg-secondary border-border text-muted-foreground hover:text-foreground hover:bg-accent'
                )}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={label}>Strategy</label>
          <select value={form.strategy} onChange={e => set('strategy', e.target.value)} className={select} required>
            <option value="">Select…</option>
            {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className={label}>Entry Price</label>
          <input type="number" step="any" placeholder="0.00" value={form.entryPrice} onChange={e => set('entryPrice', e.target.value)} className={input} required />
        </div>
        <div>
          <label className={label}>Exit Price</label>
          <input type="number" step="any" placeholder="0.00" value={form.exitPrice}  onChange={e => set('exitPrice',  e.target.value)} className={input} required />
        </div>
        <div>
          <label className={label}>Position Size</label>
          <input type="number" step="any" placeholder="1"    value={form.positionSize} onChange={e => set('positionSize', e.target.value)} className={input} required />
        </div>
        <div>
          <label className={label}>Fees</label>
          <input type="number" step="any" placeholder="0.00" value={form.fees} onChange={e => set('fees', e.target.value)} className={input} />
        </div>
      </div>

      {/* SL / TP */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Stop Loss</label>
          <input type="number" step="any" placeholder="0.00" value={form.stopLoss}   onChange={e => set('stopLoss',   e.target.value)} className={input} required />
        </div>
        <div>
          <label className={label}>Take Profit</label>
          <input type="number" step="any" placeholder="0.00" value={form.takeProfit} onChange={e => set('takeProfit', e.target.value)} className={input} required />
        </div>
      </div>

      {/* Live preview */}
      {preview && (
        <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-secondary/60 border border-border">
          {[
            { label: 'PnL',          val: `${preview.pnl >= 0 ? '+' : ''}${preview.pnl.toFixed(2)}`,          positive: preview.pnl >= 0 },
            { label: 'R Multiple',   val: `${preview.rMultiple >= 0 ? '+' : ''}${preview.rMultiple.toFixed(2)}R`, positive: preview.rMultiple >= 0 },
            { label: 'Risk : Reward',val: `1 : ${preview.riskReward.toFixed(2)}`,                              positive: true, neutral: true },
          ].map(({ label: lbl, val, positive, neutral }) => (
            <div key={lbl} className="text-center">
              <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-[0.08em]">{lbl}</div>
              <div className={cn(
                'text-base font-semibold font-mono',
                neutral ? 'text-foreground' : positive ? 'text-profit' : 'text-loss'
              )}>
                {val}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Emotion */}
      <div>
        <label className={label}>Emotion Before Trade</label>
        <div className="flex flex-wrap gap-1.5">
          {EMOTIONS.map(em => (
            <button key={em} type="button" onClick={() => set('emotionBefore', em)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-100 border',
                form.emotionBefore === em
                  ? 'bg-primary/12 border-primary/30 text-primary'
                  : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:bg-accent'
              )}>
              {em}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={label}>Notes</label>
        <textarea rows={3} placeholder="Trade rationale, setup, observations…"
          value={form.notes} onChange={e => set('notes', e.target.value)}
          className={cn(input, 'resize-none font-sans')} />
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 pt-1">
        <button type="submit"
          className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-medium text-sm hover:bg-primary/90 transition-all btn-press">
          {initial ? 'Update Trade' : 'Log Trade'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-5 bg-secondary border border-border text-foreground py-3 rounded-md font-medium text-sm hover:bg-accent transition-all btn-press">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
