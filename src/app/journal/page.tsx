'use client'

import { useEffect, useState } from 'react'
import { JournalEntry, EmotionLevel } from '@/types'
import { getJournalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } from '@/lib/storage'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { v4 as uuidv4 } from 'uuid'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const EMOTIONS: EmotionLevel[] = ['Very Calm','Calm','Neutral','Confident','Overconfident','Anxious','Very Anxious','Fearful','Greedy']

const EMOTION_DOT: Record<string, string> = {
  'Very Calm': 'bg-blue-400', 'Calm': 'bg-emerald-400', 'Neutral': 'bg-zinc-400',
  'Confident': 'bg-green-400', 'Overconfident': 'bg-yellow-400', 'Anxious': 'bg-orange-400',
  'Very Anxious': 'bg-red-400', 'Fearful': 'bg-red-600', 'Greedy': 'bg-purple-400',
}

const empty = () => ({ date: new Date().toISOString().split('T')[0], emotion: 'Neutral' as EmotionLevel, mistakes: '', lessons: '', notes: '' })

export default function JournalPage() {
  const [entries,  setEntries]  = useState<JournalEntry[]>([])
  const [loaded,   setLoaded]   = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<JournalEntry | null>(null)
  const [form,     setForm]     = useState(empty())

  useEffect(() => { setEntries(getJournalEntries()); setLoaded(true) }, [])
  const reload  = () => setEntries(getJournalEntries())
  const set     = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const openNew = () => { setEditing(null); setForm(empty()); setShowForm(true) }
  const openEdit = (e: JournalEntry) => { setEditing(e); setForm({ date: e.date, emotion: e.emotion, mistakes: e.mistakes, lessons: e.lessons, notes: e.notes }); setShowForm(true) }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    editing
      ? updateJournalEntry({ ...editing, ...form, updatedAt: now })
      : addJournalEntry({ id: uuidv4(), ...form, createdAt: now, updatedAt: now })
    setShowForm(false); reload()
  }

  return (
    <PageWrapper>
      <div className="flex justify-end mb-4">
        <button onClick={openNew} className="btn btn-primary hidden sm:inline-flex gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Entry
        </button>
      </div>

      {/* Modal — slides up from bottom on mobile */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-[3px] p-0 sm:p-4">
          <div className="card p-5 w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-xl shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[14px] font-semibold">{editing ? 'Edit Entry' : 'New Journal Entry'}</span>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-icon"><X className="w-4 h-4"/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Date</label><input type="date" value={form.date} onChange={e=>set('date',e.target.value)} className="input" required /></div>
                <div><label className="label">Emotion</label><select value={form.emotion} onChange={e=>set('emotion',e.target.value)} className="input select">{EMOTIONS.map(em=><option key={em} value={em}>{em}</option>)}</select></div>
              </div>
              {[{ k:'mistakes',l:'Mistakes Made',p:'What went wrong today?' }, { k:'lessons',l:'Lessons Learned',p:'What will you do differently?' }, { k:'notes',l:'Notes',p:'Any other reflections…' }].map(({k,l,p})=>(
                <div key={k}><label className="label">{l}</label><textarea rows={3} value={(form as any)[k]} onChange={e=>set(k,e.target.value)} placeholder={p} className="input textarea w-full"/></div>
              ))}
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn btn-primary flex-1" style={{height:36}}>{editing?'Update':'Save Entry'}</button>
                <button type="button" onClick={()=>setShowForm(false)} className="btn btn-secondary" style={{height:36}}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!loaded ? (
        <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="card p-5"><div className="flex gap-3 mb-4"><div className="skeleton h-3.5 w-24 rounded"/><div className="skeleton h-5 w-16 rounded-full"/></div><div className="grid grid-cols-3 gap-4">{[1,2,3].map(j=><div key={j}><div className="skeleton h-3 w-16 rounded mb-2"/><div className="skeleton h-12 rounded"/></div>)}</div></div>)}</div>
      ) : entries.length === 0 ? (
        <div className="card flex flex-col items-center justify-center h-56 gap-4">
          <div className="text-center"><div className="font-semibold text-[hsl(var(--fg))] mb-1">No journal entries yet</div><p className="text-[13px] text-[hsl(var(--fg-muted))]">Reflect on your trading psychology daily</p></div>
          <button onClick={openNew} className="btn btn-secondary">Add First Entry</button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div key={entry.id} className="card card-interactive p-5 group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[12px] text-[hsl(var(--fg-muted))]">{entry.date}</span>
                  <span className="flex items-center gap-1.5 badge badge-neutral">
                    <span className={cn('w-1.5 h-1.5 rounded-full', EMOTION_DOT[entry.emotion] ?? 'bg-zinc-400')} />
                    {entry.emotion}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(entry)} className="btn btn-ghost btn-icon btn-sm"><Pencil className="w-3.5 h-3.5"/></button>
                  <button onClick={() => { if(confirm('Delete?')) { deleteJournalEntry(entry.id); reload() } }} className="btn btn-ghost btn-icon btn-sm hover:text-[hsl(var(--loss))]"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
                {[{ l:'Mistakes', c:'text-loss', t:entry.mistakes }, { l:'Lessons', c:'text-profit', t:entry.lessons }, { l:'Notes', c:'text-[hsl(var(--fg-muted))]', t:entry.notes }].filter(s=>s.t).map(({l,c,t})=>(
                  <div key={l}><div className={cn('label mb-1.5',c)}>{l}</div><p className="text-[hsl(var(--fg-muted))] text-[12px] leading-relaxed">{t}</p></div>
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
