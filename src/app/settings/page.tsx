'use client'

import { useEffect, useState } from 'react'
import { getTrades, saveTrades, getJournalEntries, saveJournalEntries, exportTradesToCSV } from '@/lib/storage'
import { generateSampleData } from '@/lib/sampleData'
import { Settings, Download, Trash2, Database, Upload, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [tradeCount, setTradeCount] = useState(0)
  const [journalCount, setJournalCount] = useState(0)
  const [importText, setImportText] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    setTradeCount(getTrades().length)
    setJournalCount(getJournalEntries().length)
  }, [])

  const flash = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleExportJSON = () => {
    const data = {
      trades: getTrades(),
      journal: getJournalEntries(),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tradelog_backup_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    flash('success', 'Backup exported successfully!')
  }

  const handleExportCSV = () => {
    exportTradesToCSV(getTrades())
    flash('success', 'CSV exported!')
  }

  const handleImport = () => {
    try {
      const data = JSON.parse(importText)
      if (data.trades) saveTrades(data.trades)
      if (data.journal) saveJournalEntries(data.journal)
      setTradeCount(getTrades().length)
      setJournalCount(getJournalEntries().length)
      setImportText('')
      flash('success', 'Data imported successfully!')
    } catch {
      flash('error', 'Invalid JSON — please paste a valid backup file.')
    }
  }

  const handleLoadSample = () => {
    const { trades, journal } = generateSampleData()
    saveTrades(trades)
    saveJournalEntries(journal)
    setTradeCount(trades.length)
    setJournalCount(journal.length)
    flash('success', `Loaded ${trades.length} sample trades!`)
  }

  const handleClearAll = () => {
    if (!confirm('This will permanently delete ALL your trades and journal entries. Are you sure?')) return
    saveTrades([])
    saveJournalEntries([])
    setTradeCount(0)
    setJournalCount(0)
    flash('success', 'All data cleared.')
  }

  const cardCls = 'rounded-xl border border-border bg-card p-5'
  const btnCls = 'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all'

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your data and preferences</p>
        </div>
      </div>

      {message && (
        <div className={cn(
          'px-4 py-3 rounded-lg text-sm font-medium border',
          message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        )}>
          {message.text}
        </div>
      )}

      {/* Data Overview */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Data Overview</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="text-3xl font-bold font-mono text-primary">{tradeCount}</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Trades Logged</div>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="text-3xl font-bold font-mono text-primary">{journalCount}</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Journal Entries</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          All data is stored locally in your browser's localStorage. No data leaves your device.
        </p>
      </div>

      {/* Export */}
      <div className={cardCls}>
        <h2 className="font-semibold text-foreground mb-4">Export Data</h2>
        <div className="flex flex-col gap-3">
          <button onClick={handleExportJSON}
            className={cn(btnCls, 'bg-secondary border border-border text-foreground hover:bg-secondary/80 w-full justify-start')}>
            <Download className="w-4 h-4 text-primary" />
            Export Full Backup (JSON)
          </button>
          <button onClick={handleExportCSV}
            className={cn(btnCls, 'bg-secondary border border-border text-foreground hover:bg-secondary/80 w-full justify-start')}>
            <Download className="w-4 h-4 text-green-400" />
            Export Trades as CSV
          </button>
        </div>
      </div>

      {/* Import */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Import Backup</h2>
        </div>
        <textarea
          rows={6}
          value={importText}
          onChange={e => setImportText(e.target.value)}
          placeholder="Paste your JSON backup here..."
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none font-mono text-xs"
        />
        <button
          onClick={handleImport}
          disabled={!importText.trim()}
          className={cn(btnCls, 'mt-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed w-full justify-center')}>
          Import Data
        </button>
      </div>

      {/* Sample Data */}
      <div className={cardCls}>
        <h2 className="font-semibold text-foreground mb-2">Sample Data</h2>
        <p className="text-sm text-muted-foreground mb-4">Load 40 sample trades to explore the app's features.</p>
        <button onClick={handleLoadSample}
          className={cn(btnCls, 'bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/15 w-full justify-center')}>
          Load Sample Trades
        </button>
      </div>

      {/* Danger Zone */}
      <div className={cn(cardCls, 'border-red-500/20')}>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h2 className="font-semibold text-red-400">Danger Zone</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete all trades and journal entries. This cannot be undone.
        </p>
        <button onClick={handleClearAll}
          className={cn(btnCls, 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/15 w-full justify-center')}>
          <Trash2 className="w-4 h-4" />
          Clear All Data
        </button>
      </div>
    </div>
  )
}
