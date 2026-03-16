'use client'

import { useRouter } from 'next/navigation'
import { Trade } from '@/types'
import { addTrade } from '@/lib/storage'
import { TradeForm } from '@/components/forms/TradeForm'
import { PageWrapper } from '@/components/ui/PageWrapper'

export default function NewTradePage() {
  const router = useRouter()

  const handleSubmit = (trade: Trade) => {
    addTrade(trade)
    router.push('/trade-history')
  }

  return (
    <PageWrapper className="max-w-3xl">
      <div className="rounded-lg border border-border bg-card p-5 md:p-6 shadow-card">
        <TradeForm onSubmit={handleSubmit} />
      </div>
    </PageWrapper>
  )
}
