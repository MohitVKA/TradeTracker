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
  'Very Calm', 'Calm', 'Neutral', 'Confident', 'Overconfident',
  'Anxious', 'Very Anxious', 'Fearful', 'Greedy'
]

const STRATEGIES = [
  'Breakout', 'Mean Reversion', 'Trend Follow', 'Scalp',
  'Swing', 'Momentum', 'News Play', 'Other'
]

export function TradeForm({ initial, onSubmit, onCancel }: TradeFormProps) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    asset: '',
    tradeType: 'Long' as 'Long' | 'Short',
    strategy: '',
    entryPrice: '',
    exitPrice: '',
    positionSize: '',
    stopLoss: '',
    takeProfit: '',
    fees: '0',
    notes: '',
    emotionBefore: 'Neutral' as EmotionLevel,
    screenshotUrl: '',
  })

  const [preview, setPreview] = useState<{ pnl: number; rMultiple: number; riskReward: number } | null>(null)

  useEffect(() => {
    if (initial) {
      setForm({
        date: initial.date,
        asset: initial.asset,
        tradeType: initial.tradeType,
        strategy: initial.strategy,
        entryPrice: String(initial.entryPrice),
        exitPrice: String(initial.exitPrice),
        positionSize: String(initial.positionSize),
        stopLoss: String(initial.stopLoss),
        takeProfit: String(initial.takeProfit),
        fees: String(initial.fees),
        notes: initial.notes,
        emotionBefore: initial.emotionBefore,
        screenshotUrl: initial.screenshotUrl || '',
      })
    }
  }, [initial])

  // Live calculation preview
  useEffect(() => {
    const { entryPrice, exitPrice, positionSize, stopLoss, takeProfit, fees, tradeType } = form
    const ep = parseFloat(entryPrice), xp = parseFloat(exitPrice)
    const ps = parseFloat(positionSize), sl = parseFloat(stopLoss)
    const tp = parseFloat(takeProfit), f = parseFloat(fees) || 0
    if (ep && xp && ps && sl && tp) {
      const result = calculateTrade(ep, xp, ps, sl, tp, f, tradeType)
      setPreview(result)
    } else {
      setPreview(null)
    }
  }, [form])

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!preview) return
    const ep = parseFloat(form.entryPrice), xp = parseFloat(form.exitPrice)
    const ps = parseFloat(form.positionSize), sl = parseFloat(form.stopLoss)
    const tp = parseFloat(form.takeProfit), f = parseFloat(form.fees) || 0
    const { pnl, rMultiple, riskReward, result } = calculateTrade(ep, xp, ps, sl, tp, f, form.tradeType)
    const now = new Date().toISOString()
    const trade: Trade = {
      id: initial?.id || uuidv4(),
      date: form.date,
      asset: form.asset,
      tradeType: form.tradeType,
      strategy: form.strategy,
      entryPrice: ep, exitPrice: xp,
      positionSize: ps, stopLoss: sl, takeProfit: tp, fees: f,
      notes: form.notes,
      emotionBefore: form.emotionBefore,
      screenshotUrl: form.screenshotUrl || undefined,
      pnl, rMultiple, riskReward, result,
      createdAt: initial?.createdAt || now,
      updatedAt: now,
    }
    onSubmit(trade)
  }

  const labelCls = 'block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider'
  const inputCls = 'w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all font-mono'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={labelCls}>Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Asset / Symbol</label>
          <input placeholder="BTC/USD, AAPL..." value={form.asset} onChange={e => set('asset', e.target.value)}
            className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Direction</label>
          <div className="flex gap-2">
            {(['Long', 'Short'] as const).map(t => (
              <button key={t} type="button"
                onClick={() => set('tradeType', t)}
                className={cn(
                  'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all border',
                  form.tradeType === t && t === 'Long' ? 'bg-green-500/15 border-green-500/40 text-green-400' :
                  form.tradeType === t && t === 'Short' ? 'bg-red-500/15 border-red-500/40 text-red-400' :
                  'bg-secondary border-border text-muted-foreground hover:text-foreground'
                )}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Strategy</label>
          <select value={form.strategy} onChange={e => set('strategy', e.target.value)}
            className={inputCls} required>
            <option value="">Select...</option>
            {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Row 2 — Prices */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={labelCls}>Entry Price</label>
          <input type="number" step="any" placeholder="0.00" value={form.entryPrice}
            onChange={e => set('entryPrice', e.target.value)} className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Exit Price</label>
          <input type="number" step="any" placeholder="0.00" value={form.exitPrice}
            onChange={e => set('exitPrice', e.target.value)} className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Position Size</label>
          <input type="number" step="any" placeholder="1" value={form.positionSize}
            onChange={e => set('positionSize', e.target.value)} className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Fees</label>
          <input type="number" step="any" placeholder="0.00" value={form.fees}
            onChange={e => set('fees', e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Row 3 — SL / TP */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Stop Loss</label>
          <input type="number" step="any" placeholder="0.00" value={form.stopLoss}
            onChange={e => set('stopLoss', e.target.value)} className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Take Profit</label>
          <input type="number" step="any" placeholder="0.00" value={form.takeProfit}
            onChange={e => set('takeProfit', e.target.value)} className={inputCls} required />
        </div>
      </div>

      {/* Live Preview */}
      {preview && (
        <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">PnL</div>
            <div className={cn('text-lg font-bold font-mono', preview.pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
              {preview.pnl >= 0 ? '+' : ''}{preview.pnl.toFixed(2)}
            </div>
          </div>
          <div className="text-center border-x border-border">
            <div className="text-xs text-muted-foreground mb-1">R Multiple</div>
            <div className={cn('text-lg font-bold font-mono', preview.rMultiple >= 0 ? 'text-green-400' : 'text-red-400')}>
              {preview.rMultiple >= 0 ? '+' : ''}{preview.rMultiple.toFixed(2)}R
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Risk:Reward</div>
            <div className="text-lg font-bold font-mono text-foreground">
              1:{preview.riskReward.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Emotion */}
      <div>
        <label className={labelCls}>Emotion Before Trade</label>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map(e => (
            <button key={e} type="button" onClick={() => set('emotionBefore', e)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                form.emotionBefore === e
                  ? 'bg-primary/20 border-primary/40 text-primary'
                  : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
              )}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelCls}>Notes</label>
        <textarea rows={3} placeholder="Trade rationale, observations..."
          value={form.notes} onChange={e => set('notes', e.target.value)}
          className={cn(inputCls, 'resize-none font-sans')} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="submit"
          className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all">
          {initial ? 'Update Trade' : 'Log Trade'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-6 bg-secondary border border-border text-foreground py-3 rounded-xl font-semibold text-sm hover:bg-secondary/80 transition-all">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
