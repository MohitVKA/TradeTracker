'use client'

import { useEffect, useState } from 'react'
import { JournalEntry, EmotionLevel } from '@/types'
import {
  getJournalEntries, addJournalEntry,
  updateJournalEntry, deleteJournalEntry
} from '@/lib/storage'
import { v4 as uuidv4 } from 'uuid'
import { Brain, Plus, Pencil, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const EMOTIONS: EmotionLevel[] = [
  'Very Calm', 'Calm', 'Neutral', 'Confident', 'Overconfident',
  'Anxious', 'Very Anxious', 'Fearful', 'Greedy'
]

const EMOTION_COLOR: Record<string, string> = {
  'Very Calm': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Calm': 'bg-green-500/15 text-green-400 border-green-500/30',
  'Neutral': 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  'Confident': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Overconfident': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  'Anxious': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Very Anxious': 'bg-red-500/15 text-red-400 border-red-500/30',
  'Fearful': 'bg-red-600/15 text-red-500 border-red-600/30',
  'Greedy': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
}

const emptyForm = () => ({
  date: new Date().toISOString().split('T')[0],
  emotion: 'Neutral' as EmotionLevel,
  mistakes: '',
  lessons: '',
  notes: '',
})

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<JournalEntry | null>(null)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    setEntries(getJournalEntries())
  }, [])

  const reload = () => setEntries(getJournalEntries())

  const openNew = () => {
    setEditing(null)
    setForm(emptyForm())
    setShowForm(true)
  }

  const openEdit = (entry: JournalEntry) => {
    setEditing(entry)
    setForm({
      date: entry.date,
      emotion: entry.emotion,
      mistakes: entry.mistakes,
      lessons: entry.lessons,
      notes: entry.notes,
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this journal entry?')) return
    deleteJournalEntry(id)
    reload()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    if (editing) {
      updateJournalEntry({ ...editing, ...form, updatedAt: now })
    } else {
      addJournalEntry({ id: uuidv4(), ...form, createdAt: now, updatedAt: now })
    }
    setShowForm(false)
    reload()
  }

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  const labelCls = 'block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider'
  const inputCls = 'w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all'

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Psychology Journal</h1>
            <p className="text-muted-foreground text-sm">Daily reflections on your trading mindset</p>
          </div>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Entry' : 'New Entry'}</h2>
              <button onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date</label>
                  <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                    className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Emotion</label>
                  <select value={form.emotion} onChange={e => set('emotion', e.target.value)} className={inputCls}>
                    {EMOTIONS.map(em => <option key={em} value={em}>{em}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Mistakes Made</label>
                <textarea rows={3} value={form.mistakes} onChange={e => set('mistakes', e.target.value)}
                  placeholder="What mistakes did you make today?" className={cn(inputCls, 'resize-none')} />
              </div>
              <div>
                <label className={labelCls}>Lessons Learned</label>
                <textarea rows={3} value={form.lessons} onChange={e => set('lessons', e.target.value)}
                  placeholder="What did you learn?" className={cn(inputCls, 'resize-none')} />
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
                  placeholder="Any other thoughts..." className={cn(inputCls, 'resize-none')} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all">
                  {editing ? 'Update Entry' : 'Save Entry'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 bg-secondary border border-border py-3 rounded-xl font-semibold text-sm hover:bg-secondary/80 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-border bg-card text-muted-foreground gap-3">
          <Brain className="w-10 h-10 opacity-30" />
          <div className="text-center">
            <div className="font-medium text-foreground">No journal entries yet</div>
            <div className="text-sm mt-1">Start reflecting on your trading psychology</div>
          </div>
          <button onClick={openNew}
            className="mt-2 px-4 py-2 rounded-lg bg-primary/15 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-all">
            Add First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="rounded-xl border border-border bg-card p-5 group hover:border-border/80 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">{entry.date}</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium border',
                    EMOTION_COLOR[entry.emotion] || 'bg-secondary text-muted-foreground border-border'
                  )}>
                    {entry.emotion}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(entry)}
                    className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(entry.id)}
                    className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {entry.mistakes && (
                  <div>
                    <div className="text-xs font-medium text-red-400/80 uppercase tracking-wider mb-1.5">Mistakes</div>
                    <p className="text-muted-foreground leading-relaxed">{entry.mistakes}</p>
                  </div>
                )}
                {entry.lessons && (
                  <div>
                    <div className="text-xs font-medium text-green-400/80 uppercase tracking-wider mb-1.5">Lessons</div>
                    <p className="text-muted-foreground leading-relaxed">{entry.lessons}</p>
                  </div>
                )}
                {entry.notes && (
                  <div>
                    <div className="text-xs font-medium text-blue-400/80 uppercase tracking-wider mb-1.5">Notes</div>
                    <p className="text-muted-foreground leading-relaxed">{entry.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
