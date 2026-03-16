'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title:       string
  value:       string
  subtitle?:   string
  icon?:       LucideIcon
  trend?:      'up' | 'down' | 'neutral'
  trendLabel?: string
  className?:  string
  valueColor?: 'profit' | 'loss' | 'default'
  loading?:    boolean
}

export function StatsCard({
  title, value, subtitle, icon: Icon,
  trend, trendLabel, className,
  valueColor = 'default',
  loading = false,
}: StatsCardProps) {
  if (loading) {
    return (
      <div className={cn('card p-4 flex flex-col gap-3', className)}>
        <div className="flex items-center justify-between">
          <div className="skeleton h-[11px] w-20 rounded" />
          <div className="skeleton h-6 w-6 rounded-md" />
        </div>
        <div className="skeleton h-7 w-28 rounded" />
        <div className="skeleton h-[11px] w-20 rounded" />
      </div>
    )
  }

  return (
    <div className={cn('card card-interactive p-4 flex flex-col gap-2', className)}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="label mb-0">{title}</span>
        {Icon && (
          <div className="w-6 h-6 rounded-md bg-[hsl(var(--bg-overlay))] flex items-center justify-center">
            <Icon className="w-3 h-3 text-[hsl(var(--fg-subtle))]" strokeWidth={1.8} />
          </div>
        )}
      </div>

      {/* Value */}
      <div
        className={cn(
          'text-[22px] font-semibold font-mono tracking-tight leading-none mt-0.5',
          valueColor === 'profit' && 'text-profit',
          valueColor === 'loss'   && 'text-loss',
          valueColor === 'default' && 'text-fg',
        )}
      >
        {value}
      </div>

      {/* Trend badge + subtitle */}
      {(subtitle || trendLabel) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {trendLabel && (
            <span className={cn(
              'badge',
              trend === 'up'      && 'badge-profit',
              trend === 'down'    && 'badge-loss',
              trend === 'neutral' && 'badge-neutral',
            )}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'} {trendLabel}
            </span>
          )}
          {subtitle && (
            <span className="text-[12px] text-[hsl(var(--fg-muted))]">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  )
}
