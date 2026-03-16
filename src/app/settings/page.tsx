'use client'

import { useEffect, useState } from 'react'
import { getTrades, saveTrades, getJournalEntries, saveJournalEntries, exportTradesToCSV } from '@/lib/storage'
import { generateSampleData } from '@/lib/sampleData'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { Download, Trash2, Database, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [tc, setTc] = useState(0)
  const [jc, setJc] = useState(0)
  const [imp, setImp] = useState('')
  const [msg, setMsg] = useState<{type:'success'|'error';text:string}|null>(null)

  useEffect(() => { setTc(getTrades().length); setJc(getJournalEntries().length) }, [])

  const flash = (type: 'success'|'error', text: string) => { setMsg({type,text}); setTimeout(()=>setMsg(null),3500) }

  const row = 'flex items-center gap-2.5 w-full px-4 py-2.5 rounded-md text-[13px] font-medium transition-all duration-150 active:scale-[0.98] text-left border'

  return (
    <PageWrapper className="max-w-2xl">
      {/* Toast */}
      {msg && (
        <div className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5',
          'card px-4 py-3 text-[13px] font-medium shadow-xl border min-w-64',
          msg.type === 'success' ? 'text-profit border-[hsl(var(--profit)/0.3)]' : 'text-loss border-[hsl(var(--loss)/0.3)]',
        )}>
          {msg.type==='success' ? <CheckCircle2 className="w-4 h-4 shrink-0"/> : <AlertTriangle className="w-4 h-4 shrink-0"/>}
          {msg.text}
        </div>
      )}

      <div className="space-y-4">
        {/* Data overview */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-[hsl(var(--fg-muted))]" />
            <span className="text-[13px] font-semibold text-[hsl(var(--fg))]">Data Overview</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{l:'Trades Logged',v:tc},{l:'Journal Entries',v:jc}].map(({l,v})=>(
              <div key={l} className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg-subtle))] p-4">
                <div className="text-[28px] font-semibold font-mono text-[hsl(var(--fg))] mb-1">{v}</div>
                <div className="label mb-0">{l}</div>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-[hsl(var(--fg-muted))] mt-4">All data lives in your browser's localStorage. Nothing leaves your device.</p>
        </div>

        {/* Export */}
        <div className="card p-5">
          <span className="text-[13px] font-semibold text-[hsl(var(--fg))] block mb-3">Export Data</span>
          <div className="space-y-2">
            <button onClick={()=>{ const d={trades:getTrades(),journal:getJournalEntries(),exportedAt:new Date().toISOString()}; const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download=`tradelog_${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(u); flash('success','Backup exported!') }}
              className={cn(row,'bg-[hsl(var(--bg-raised))] border-[hsl(var(--border))] text-[hsl(var(--fg))] hover:bg-[hsl(var(--bg-overlay))] hover:border-[hsl(var(--fg-subtle))]')}>
              <Download className="w-4 h-4 text-[hsl(var(--fg-muted))]"/> Export Full Backup (JSON)
            </button>
            <button onClick={()=>{ exportTradesToCSV(getTrades()); flash('success','CSV exported!') }}
              className={cn(row,'bg-[hsl(var(--bg-raised))] border-[hsl(var(--border))] text-[hsl(var(--fg))] hover:bg-[hsl(var(--bg-overlay))] hover:border-[hsl(var(--fg-subtle))]')}>
              <Download className="w-4 h-4 text-profit"/> Export Trades as CSV
            </button>
          </div>
        </div>

        {/* Import */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3"><Upload className="w-4 h-4 text-[hsl(var(--fg-muted))]"/><span className="text-[13px] font-semibold text-[hsl(var(--fg))]">Import Backup</span></div>
          <textarea rows={5} value={imp} onChange={e=>setImp(e.target.value)} placeholder="Paste your JSON backup here…" className="input textarea w-full font-mono text-[12px]"/>
          <button onClick={()=>{ try{ const d=JSON.parse(imp); if(d.trades)saveTrades(d.trades); if(d.journal)saveJournalEntries(d.journal); setTc(getTrades().length); setJc(getJournalEntries().length); setImp(''); flash('success','Imported!') }catch{ flash('error','Invalid JSON') } }} disabled={!imp.trim()} className="btn btn-primary w-full mt-3 disabled:opacity-40" style={{height:36}}>Import Data</button>
        </div>

        {/* Sample */}
        <div className="card p-5">
          <span className="text-[13px] font-semibold text-[hsl(var(--fg))] block mb-1">Sample Data</span>
          <p className="text-[12px] text-[hsl(var(--fg-muted))] mb-3">Load 40 demo trades to explore the app.</p>
          <button onClick={()=>{ const {trades,journal}=generateSampleData(); saveTrades(trades); saveJournalEntries(journal); setTc(trades.length); setJc(journal.length); flash('success',`Loaded ${trades.length} sample trades!`) }} className="btn btn-secondary w-full" style={{height:36}}>Load Sample Trades</button>
        </div>

        {/* Danger */}
        <div className="card p-5 border-[hsl(var(--loss)/0.25)]">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-loss"/><span className="text-[13px] font-semibold text-loss">Danger Zone</span></div>
          <p className="text-[12px] text-[hsl(var(--fg-muted))] mb-3">Permanently delete all data. Cannot be undone.</p>
          <button onClick={()=>{ if(!confirm('Delete ALL data?'))return; saveTrades([]); saveJournalEntries([]); setTc(0); setJc(0); flash('success','All data cleared.') }} className="btn btn-danger w-full gap-2" style={{height:36}}>
            <Trash2 className="w-4 h-4"/> Clear All Data
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}
