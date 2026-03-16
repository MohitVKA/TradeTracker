import { cn } from '@/lib/utils'
import React from 'react'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-secondary/50 px-4 py-3 flex gap-4 border-b border-border">
        {[60, 80, 50, 90, 60, 60, 70, 50, 60].map((w, i) => (
          <Skeleton key={i} className="h-3" style={{ width: w }} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-3.5 flex gap-4 border-b border-border last:border-0"
        >
          {[60, 80, 50, 90, 60, 60, 70, 50, 60].map((w, j) => (
            <Skeleton key={j} className="h-3" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>

        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>

      <Skeleton className="w-full rounded-lg" style={{ height }} />
    </div>
  )
}