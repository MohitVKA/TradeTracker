'use client'

import { EquityPoint } from '@/types'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value as number
  return (
    <div className="card px-3 py-2 text-[12px] shadow-xl">
      <div className="text-[hsl(var(--fg-muted))] mb-1 font-medium">{label}</div>
      <div
        className="font-mono font-semibold"
        style={{ color: val >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))' }}
      >
        {val >= 0 ? '+' : ''}{val?.toFixed(2)}
      </div>
    </div>
  )
}

const axisStyle = {
  fontSize: 10,
  fill: 'hsl(var(--fg-subtle))',
  fontFamily: 'Geist Mono, monospace',
}

export function EquityChart({ data, height = 220 }: { data: EquityPoint[]; height?: number }) {
  if (data.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-[hsl(var(--fg-muted))] text-[13px]"
        style={{ height }}
      >
        Add trades to see your equity curve
      </div>
    )
  }

  const last     = data[data.length - 1]?.equity ?? 0
  const positive = last >= 0
  const stroke   = positive ? 'hsl(142 76% 42%)' : 'hsl(0 72% 51%)'
  const gid      = positive ? 'gUp' : 'gDown'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 6, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={stroke} stopOpacity={0.18} />
            <stop offset="95%" stopColor={stroke} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={v =>
            `$${v < 0 ? '-' : ''}${Math.abs(v) >= 1000
              ? (Math.abs(v) / 1000).toFixed(1) + 'k'
              : Math.abs(v).toFixed(0)}`
          }
        />
        <Tooltip content={<Tip />} />
        <Area
          type="monotone"
          dataKey="equity"
          stroke={stroke}
          strokeWidth={1.5}
          fill={`url(#${gid})`}
          dot={false}
          activeDot={{ r: 3, fill: stroke, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
