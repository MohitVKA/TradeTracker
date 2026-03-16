'use client'

import { useEffect, useState } from 'react'
import { JournalEntry, EmotionLevel } from '@/types'
import { getJournalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } from '@/lib/storage'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { v4 as uuidv4 } from 'uuid'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const EMOTIONS: EmotionLevel[] = [
  'Very Calm','Calm','Neutral','Confident','Overconfident',
  'Anxious','Very Anxious','Fearful','Greedy',
]

const EMOTION_STYLE: Record<string, string> = {
  'Very Calm':     'bg-blue-500/10 text-blue-400 border-blue-500/25',
  'Calm':          'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  'Neutral':       'bg-secondary text-muted-foreground border-border',
  'Confident':     'bg-green-500/10 text-green-400 border-green-500/25',
  'Overconfident': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/25',
  'Anxious':       'bg-orange-500/10 text-orange-400 border-orange-500/25',
  'Very Anxious':  'bg-red-500/10 text-red-400 border-red-500/25',
  'Fearful':       'bg-red-600/10 text-red-500 border-red-600/25',
  'Greedy':        'bg-purple-500/10 text-purple-400 border-purple-500/25',
}

const emptyForm = () => ({
  date:     new Date().toISOString().split('T')[0],
  emotion:  'Neutral' as EmotionLevel,
  mistakes: '',
  lessons:  '',
  notes:    '',
})

export default function JournalPage() {
  const [entries,  setEntries]  = useState<JournalEntry[]>([])
  const [loaded,   setLoaded]   = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<JournalEntry | null>(null)
  const [form,     setForm]     = useState(emptyForm())

  useEffect(() => { setEntries(getJournalEntries()); setLoaded(true) }, [])

  const reload    = () => setEntries(getJournalEntries())
  const set       = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))
  const openNew   = () => { setEditing(null); setForm(emptyForm()); setShowForm(true) }
  const openEdit  = (e: JournalEntry) => { setEditing(e); setForm({ date: e.date, emotion: e.emotion, mistakes: e.mistakes, lessons: e.lessons, notes: e.notes }); setShowForm(true) }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this entry?')) return
    deleteJournalEntry(id); reload()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    if (editing) {
      updateJournalEntry({ ...editing, ...form, updatedAt: now })
    } else {
      addJournalEntry({ id: uuidv4(), ...form, createdAt: now, updatedAt: now })
    }
    setShowForm(false); reload()
  }

  const inputCls  = 'w-full bg-secondary border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all'
  const labelCls  = 'block text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-[0.1em]'

  return (
    <PageWrapper>
      {/* Header action */}
      <div className="flex items-center justify-end mb-5">
        <button
          onClick={openNew}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all btn-press"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-[3px] p-0 sm:p-4">
          <div className="bg-card border border-border rounded-t-2xl sm:rounded-xl p-5 w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">{editing ? 'Edit Entry' : 'New Journal Entry'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date</label>
                  <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Emotion</label>
                  <select value={form.emotion} onChange={e => set('emotion', e.target.value)} className={inputCls}>
                    {EMOTIONS.map(em => <option key={em} value={em}>{em}</option>)}
                  </select>
                </div>
              </div>
              {[
                { key: 'mistakes', label: 'Mistakes Made',    placeholder: 'What went wrong today?' },
                { key: 'lessons',  label: 'Lessons Learned',  placeholder: 'What will you do differently?' },
                { key: 'notes',    label: 'Notes',            placeholder: 'Any other reflections…' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <textarea
                    rows={3}
                    value={(form as any)[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={placeholder}
                    className={cn(inputCls, 'resize-none')}
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-all btn-press">
                  {editing ? 'Update' : 'Save Entry'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 bg-secondary border border-border py-2.5 rounded-md text-sm font-medium hover:bg-accent transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entries */}
      {!loaded ? (
        <div className="space-y-3">
          {Array.from({length:3}).map((_,i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5">
              <div className="flex gap-3 mb-4"><div className="skeleton h-3.5 w-24 rounded"/><div className="skeleton h-5 w-16 rounded-full"/></div>
              <div className="grid grid-cols-3 gap-4">{[1,2,3].map(j => <div key={j}><div className="skeleton h-3 w-16 rounded mb-2"/><div className="skeleton h-12 rounded"/></div>)}</div>
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 rounded-lg border border-border bg-card text-center gap-4">
          <div>
            <div className="font-semibold text-foreground mb-1">No journal entries yet</div>
            <p className="text-sm text-muted-foreground">Reflect on your trading psychology daily</p>
          </div>
          <button onClick={openNew} className="px-4 py-2.5 rounded-md bg-primary/12 border border-primary/25 text-primary text-sm font-medium hover:bg-primary/18 transition-all btn-press">
            Add First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div key={entry.id} className="rounded-lg border border-border bg-card p-5 group shadow-card hover:shadow-card-hover card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs text-muted-foreground">{entry.date}</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium border', EMOTION_STYLE[entry.emotion] || 'bg-secondary text-muted-foreground border-border')}>
                    {entry.emotion}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(entry)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5"/></button>
                  <button onClick={() => handleDelete(entry.id)} className="p-1.5 rounded-md hover:bg-loss-subtle text-muted-foreground hover:text-loss transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {[
                  { label: 'Mistakes', color: 'text-loss/70', text: entry.mistakes },
                  { label: 'Lessons',  color: 'text-profit/70', text: entry.lessons },
                  { label: 'Notes',    color: 'text-primary/70', text: entry.notes },
                ].filter(s => s.text).map(({ label, color, text }) => (
                  <div key={label}>
                    <div className={cn('text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5', color)}>{label}</div>
                    <p className="text-muted-foreground text-xs leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <FloatingActionButton />
    </PageWrapper>
  )
}
