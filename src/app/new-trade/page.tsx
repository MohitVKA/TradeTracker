'use client'

import { useRouter } from 'next/navigation'
import { Trade } from '@/types'
import { addTrade } from '@/lib/storage'
import { TradeForm } from '@/components/forms/TradeForm'
import { PageWrapper } from '@/components/ui/PageWrapper'

export default function NewTradePage() {
  const router = useRouter()
  return (
    <PageWrapper className="max-w-3xl">
      <div className="card p-5 md:p-6">
        <TradeForm onSubmit={(t: Trade) => { addTrade(t); router.push('/trade-history') }} />
      </div>
    </PageWrapper>
  )
}
