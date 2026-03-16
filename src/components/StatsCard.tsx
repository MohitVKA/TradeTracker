import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
  valueColor?: 'profit' | 'loss' | 'default'
}

export function StatsCard({
  title, value, subtitle, icon: Icon, trend, trendValue, className, valueColor = 'default'
}: StatsCardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-card p-5 flex flex-col gap-3 animate-fade-in',
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          {title}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className={cn(
        'text-2xl font-bold font-mono tracking-tight',
        valueColor === 'profit' && 'text-green-400',
        valueColor === 'loss' && 'text-red-400',
        valueColor === 'default' && 'text-foreground',
      )}>
        {value}
      </div>

      {(subtitle || trendValue) && (
        <div className="flex items-center gap-2">
          {trendValue && (
            <span className={cn(
              'text-xs font-medium px-1.5 py-0.5 rounded',
              trend === 'up' && 'bg-green-500/10 text-green-400',
              trend === 'down' && 'bg-red-500/10 text-red-400',
              trend === 'neutral' && 'bg-secondary text-muted-foreground',
            )}>
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
