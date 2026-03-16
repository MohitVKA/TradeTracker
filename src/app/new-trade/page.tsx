'use client'

import { useRouter } from 'next/navigation'
import { Trade } from '@/types'
import { addTrade } from '@/lib/storage'
import { TradeForm } from '@/components/forms/TradeForm'
import { PlusCircle } from 'lucide-react'

export default function NewTradePage() {
  const router = useRouter()

  const handleSubmit = (trade: Trade) => {
    addTrade(trade)
    router.push('/trade-history')
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
          <PlusCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Log Trade</h1>
          <p className="text-muted-foreground text-sm">Record a new trade entry</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <TradeForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
