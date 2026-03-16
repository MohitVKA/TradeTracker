'use client'

import { useEffect, useState } from 'react'
import { getTrades, saveTrades, getJournalEntries, saveJournalEntries, exportTradesToCSV } from '@/lib/storage'
import { generateSampleData } from '@/lib/sampleData'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { Download, Trash2, Database, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [tradeCount,   setTradeCount]   = useState(0)
  const [journalCount, setJournalCount] = useState(0)
  const [importText,   setImportText]   = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    setTradeCount(getTrades().length)
    setJournalCount(getJournalEntries().length)
  }, [])

  const flash = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3500)
  }

  const handleExportJSON = () => {
    const data = { trades: getTrades(), journal: getJournalEntries(), exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `tradelog_backup_${new Date().toISOString().split('T')[0]}.json`; a.click()
    URL.revokeObjectURL(url)
    flash('success', 'Backup exported!')
  }

  const handleImport = () => {
    try {
      const data = JSON.parse(importText)
      if (data.trades)  saveTrades(data.trades)
      if (data.journal) saveJournalEntries(data.journal)
      setTradeCount(getTrades().length)
      setJournalCount(getJournalEntries().length)
      setImportText('')
      flash('success', 'Data imported successfully!')
    } catch {
      flash('error', 'Invalid JSON — paste a valid backup file.')
    }
  }

  const handleLoadSample = () => {
    const { trades, journal } = generateSampleData()
    saveTrades(trades); saveJournalEntries(journal)
    setTradeCount(trades.length); setJournalCount(journal.length)
    flash('success', `Loaded ${trades.length} sample trades!`)
  }

  const handleClearAll = () => {
    if (!confirm('This will permanently delete ALL your trades and journal entries. Are you sure?')) return
    saveTrades([]); saveJournalEntries([])
    setTradeCount(0); setJournalCount(0)
    flash('success', 'All data cleared.')
  }

  const card    = 'rounded-lg border border-border bg-card p-5 shadow-card'
  const btnRow  = 'flex items-center gap-2.5 w-full px-4 py-3 rounded-md text-sm font-medium transition-all duration-150 btn-press text-left'

  return (
    <PageWrapper className="max-w-2xl">
      {/* Toast */}
      {message && (
        <div className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm font-medium shadow-xl transition-all',
          message.type === 'success'
            ? 'bg-card border-profit/30 text-profit'
            : 'bg-card border-loss/30 text-loss'
        )}>
          {message.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertTriangle className="w-4 h-4 shrink-0" />
          }
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* Data overview */}
        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground text-sm">Data Overview</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Trades Logged', value: tradeCount },
              { label: 'Journal Entries', value: journalCount },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 rounded-md bg-secondary border border-border">
                <div className="text-3xl font-semibold font-mono text-primary mb-1">{value}</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-[0.1em]">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            All data is stored locally in your browser's localStorage. Nothing leaves your device.
          </p>
        </div>

        {/* Export */}
        <div className={card}>
          <h2 className="font-semibold text-foreground text-sm mb-3">Export Data</h2>
          <div className="space-y-2">
            <button onClick={handleExportJSON} className={cn(btnRow, 'bg-secondary border border-border hover:bg-accent')}>
              <Download className="w-4 h-4 text-primary shrink-0" />
              Export Full Backup (JSON)
            </button>
            <button onClick={() => exportTradesToCSV(getTrades())} className={cn(btnRow, 'bg-secondary border border-border hover:bg-accent')}>
              <Download className="w-4 h-4 text-profit shrink-0" />
              Export Trades as CSV
            </button>
          </div>
        </div>

        {/* Import */}
        <div className={card}>
          <div className="flex items-center gap-2 mb-3">
            <Upload className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground text-sm">Import Backup</h2>
          </div>
          <textarea
            rows={5}
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder="Paste your JSON backup here…"
            className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 text-xs text-foreground placeholder-muted-foreground/50 font-mono focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
          />
          <button
            onClick={handleImport}
            disabled={!importText.trim()}
            className="mt-3 w-full py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all btn-press disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Import Data
          </button>
        </div>

        {/* Sample data */}
        <div className={card}>
          <h2 className="font-semibold text-foreground text-sm mb-1">Sample Data</h2>
          <p className="text-xs text-muted-foreground mb-3">Load 40 demo trades to explore the app.</p>
          <button onClick={handleLoadSample} className={cn(btnRow, 'bg-primary/8 border border-primary/20 text-primary hover:bg-primary/12 justify-center')}>
            Load Sample Trades
          </button>
        </div>

        {/* Danger zone */}
        <div className={cn(card, 'border-loss/20')}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-loss" />
            <h2 className="font-semibold text-loss text-sm">Danger Zone</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Permanently delete all data. This cannot be undone.</p>
          <button onClick={handleClearAll} className={cn(btnRow, 'bg-loss-subtle border border-loss/20 text-loss hover:bg-loss/15 justify-center')}>
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}
