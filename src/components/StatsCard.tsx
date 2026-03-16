'use client'

import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
  valueColor?: 'profit' | 'loss' | 'default'
  loading?: boolean
}

export function StatsCard({
  title, value, subtitle, icon: Icon,
  trend, trendValue, className,
  valueColor = 'default',
  loading = false,
}: StatsCardProps) {
  if (loading) {
    return (
      <div className={cn(
        'rounded-lg border border-border bg-card p-5 flex flex-col gap-3',
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 skeleton rounded" />
          <div className="h-7 w-7 skeleton rounded-md" />
        </div>
        <div className="h-8 w-28 skeleton rounded" />
        <div className="h-3.5 w-24 skeleton rounded" />
      </div>
    )
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div className={cn(
      'rounded-lg border border-border bg-card p-5 flex flex-col gap-2.5',
      'shadow-card hover:shadow-card-hover card-hover',
      'dark:shadow-card dark:hover:shadow-card-hover',
      className
    )}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em]">
          {title}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className={cn(
        'text-2xl font-semibold font-mono tracking-tight leading-none',
        valueColor === 'profit' && 'text-profit',
        valueColor === 'loss' && 'text-loss',
        valueColor === 'default' && 'text-foreground',
      )}>
        {value}
      </div>

      {/* Trend / subtitle */}
      {(subtitle || trendValue) && (
        <div className="flex items-center gap-1.5 mt-0.5">
          {trendValue && (
            <span className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-sm',
              trend === 'up' && 'bg-profit-subtle text-profit',
              trend === 'down' && 'bg-loss-subtle text-loss',
              trend === 'neutral' && 'bg-secondary text-muted-foreground',
            )}>
              <TrendIcon className="w-2.5 h-2.5" />
              {trendValue}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  )
}
