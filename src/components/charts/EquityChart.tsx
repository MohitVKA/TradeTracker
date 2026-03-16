'use client'

import { EquityPoint } from '@/types'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

interface EquityChartProps {
  data: EquityPoint[]
  height?: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value as number
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-muted-foreground mb-1 font-medium">{label}</div>
      <div className={`font-mono font-semibold ${val >= 0 ? 'text-profit' : 'text-loss'}`}>
        {val >= 0 ? '+' : ''}{val?.toFixed(2)}
      </div>
      {payload[1] && (
        <div className={`text-xs mt-0.5 ${payload[1].value >= 0 ? 'text-profit' : 'text-loss'} opacity-70`}>
          Trade: {payload[1].value >= 0 ? '+' : ''}{payload[1].value?.toFixed(2)}
        </div>
      )}
    </div>
  )
}

export function EquityChart({ data, height = 220 }: EquityChartProps) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm" style={{ height }}>
        Add trades to see your equity curve
      </div>
    )
  }

  const lastVal   = data[data.length - 1]?.equity ?? 0
  const isPositive = lastVal >= 0
  const stroke = isPositive ? 'hsl(142 71% 45%)' : 'hsl(0 72% 51%)'
  const gradId = isPositive ? 'equityUp' : 'equityDown'

  const axisProps = {
    tick: { fontSize: 10, fill: 'hsl(215 10% 46%)', fontFamily: 'IBM Plex Mono' },
    tickLine: false as const,
    axisLine: false as const,
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={stroke} stopOpacity={0.22} />
            <stop offset="95%" stopColor={stroke} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 14%)" vertical={false} />
        <XAxis dataKey="date" {...axisProps} interval="preserveStartEnd" />
        <YAxis
          {...axisProps}
          tickFormatter={v => `$${v >= 0 ? '' : '-'}${Math.abs(v) >= 1000 ? (Math.abs(v)/1000).toFixed(1)+'k' : Math.abs(v).toFixed(0)}`}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="equity"
          stroke={stroke}
          strokeWidth={1.5}
          fill={`url(#${gradId})`}
          dot={false}
          activeDot={{ r: 3.5, fill: stroke, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
