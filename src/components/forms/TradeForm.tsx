'use client'

import { useState, useEffect } from 'react'
import { Trade, EmotionLevel } from '@/types'
import { calculateTrade } from '@/lib/calculations'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

interface TradeFormProps {
  initial?:  Trade
  onSubmit:  (t: Trade) => void
  onCancel?: () => void
}

const EMOTIONS: EmotionLevel[] = [
  'Very Calm','Calm','Neutral','Confident','Overconfident',
  'Anxious','Very Anxious','Fearful','Greedy',
]
const STRATEGIES = [
  'Breakout','Mean Reversion','Trend Follow','Scalp','Swing','Momentum','News Play','Other',
]

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

  const [preview, setPreview] = useState<{
    pnl: number; rMultiple: number; riskReward: number
  } | null>(null)

  useEffect(() => {
    if (!initial) return
    setForm({
      date: initial.date, asset: initial.asset, tradeType: initial.tradeType,
      strategy: initial.strategy, entryPrice: String(initial.entryPrice),
      exitPrice: String(initial.exitPrice), positionSize: String(initial.positionSize),
      stopLoss: String(initial.stopLoss), takeProfit: String(initial.takeProfit),
      fees: String(initial.fees), notes: initial.notes, emotionBefore: initial.emotionBefore,
    })
  }, [initial])

  useEffect(() => {
    const ep = parseFloat(form.entryPrice), xp = parseFloat(form.exitPrice)
    const ps = parseFloat(form.positionSize), sl = parseFloat(form.stopLoss)
    const tp = parseFloat(form.takeProfit),  f  = parseFloat(form.fees) || 0
    if (ep && xp && ps && sl && tp) setPreview(calculateTrade(ep, xp, ps, sl, tp, f, form.tradeType))
    else setPreview(null)
  }, [form])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!preview) return
    const ep = parseFloat(form.entryPrice), xp = parseFloat(form.exitPrice)
    const ps = parseFloat(form.positionSize), sl = parseFloat(form.stopLoss)
    const tp = parseFloat(form.takeProfit),  f  = parseFloat(form.fees) || 0
    const { pnl, rMultiple, riskReward, result } = calculateTrade(ep, xp, ps, sl, tp, f, form.tradeType)
    const now = new Date().toISOString()
    onSubmit({
      id: initial?.id || uuidv4(),
      date: form.date, asset: form.asset, tradeType: form.tradeType,
      strategy: form.strategy, entryPrice: ep, exitPrice: xp,
      positionSize: ps, stopLoss: sl, takeProfit: tp, fees: f,
      notes: form.notes, emotionBefore: form.emotionBefore,
      pnl, rMultiple, riskReward, result,
      createdAt: initial?.createdAt || now,
      updatedAt: now,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="label">Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="input" required />
        </div>
        <div>
          <label className="label">Asset / Symbol</label>
          <input placeholder="BTC, AAPL, ES…" value={form.asset} onChange={e => set('asset', e.target.value)}
            className="input" required />
        </div>
        <div>
          <label className="label">Direction</label>
          <div className="flex gap-1.5 h-[34px]">
            {(['Long','Short'] as const).map(t => (
              <button
                key={t} type="button"
                onClick={() => set('tradeType', t)}
                className={cn(
                  'btn flex-1 text-[13px]',
                  form.tradeType === t && t === 'Long'  ? 'btn-primary' :
                  form.tradeType === t && t === 'Short' ? 'btn-primary' :
                  'btn-secondary',
                  /* override bg/color for active Long/Short */
                  form.tradeType === t && t === 'Long'  && '!bg-[hsl(var(--profit))] !text-white !border-[hsl(var(--profit))]',
                  form.tradeType === t && t === 'Short' && '!bg-[hsl(var(--loss))] !text-white !border-[hsl(var(--loss))]',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Strategy</label>
          <select value={form.strategy} onChange={e => set('strategy', e.target.value)}
            className="input select" required>
            <option value="">Select…</option>
            {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'entryPrice',   label: 'Entry Price' },
          { key: 'exitPrice',    label: 'Exit Price'  },
          { key: 'positionSize', label: 'Position Size' },
          { key: 'fees',         label: 'Fees'        },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input type="number" step="any" placeholder="0.00"
              value={(form as any)[key]}
              onChange={e => set(key, e.target.value)}
              className="input input-mono"
              required={key !== 'fees'}
            />
          </div>
        ))}
      </div>

      {/* SL / TP */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Stop Loss</label>
          <input type="number" step="any" placeholder="0.00" value={form.stopLoss}
            onChange={e => set('stopLoss', e.target.value)} className="input input-mono" required />
        </div>
        <div>
          <label className="label">Take Profit</label>
          <input type="number" step="any" placeholder="0.00" value={form.takeProfit}
            onChange={e => set('takeProfit', e.target.value)} className="input input-mono" required />
        </div>
      </div>

      {/* Live preview */}
      {preview && (
        <div className="grid grid-cols-3 divide-x divide-[hsl(var(--border))] rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg-subtle))] overflow-hidden">
          {[
            { label: 'PnL',          val: `${preview.pnl >= 0 ? '+' : ''}${preview.pnl.toFixed(2)}`,           profit: preview.pnl >= 0,        neutral: false },
            { label: 'R Multiple',   val: `${preview.rMultiple >= 0 ? '+' : ''}${preview.rMultiple.toFixed(2)}R`, profit: preview.rMultiple >= 0, neutral: false },
            { label: 'Risk : Reward',val: `1 : ${preview.riskReward.toFixed(2)}`,                                profit: true,                   neutral: true  },
          ].map(({ label, val, profit, neutral }) => (
            <div key={label} className="py-3 text-center">
              <div className="label mb-1">{label}</div>
              <div className={cn(
                'font-mono font-semibold text-[15px]',
                neutral ? 'text-fg' : profit ? 'text-profit' : 'text-loss',
              )}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Emotion */}
      <div>
        <label className="label">Emotion Before Trade</label>
        <div className="flex flex-wrap gap-1.5">
          {EMOTIONS.map(em => (
            <button
              key={em} type="button"
              onClick={() => set('emotionBefore', em)}
              className={cn(
                'btn btn-sm rounded-full',
                form.emotionBefore === em ? 'btn-primary' : 'btn-secondary',
              )}
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes</label>
        <textarea
          rows={3}
          placeholder="Trade rationale, observations…"
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          className="input textarea w-full"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-2.5 pt-1">
        <button type="submit" className="btn btn-primary flex-1" style={{ height: 38 }}>
          {initial ? 'Update Trade' : 'Log Trade'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ height: 38 }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
