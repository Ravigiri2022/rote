import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { BarChart3, Pencil, Play, Trash2 } from 'lucide-react'
import { sessionScore, useStore } from '../store'
import type { Phrase } from '../types'
import { Button, Modal, RepsInput } from './ui'

interface Props {
  open: boolean
  onClose: () => void
  onContinue: (phraseId: string) => void
  onReport: (phraseId: string, sessionId: string) => void
}

export default function SavedModal({ open, onClose, onContinue, onReport }: Props) {
  const phrases = useStore((s) => s.phrases)
  const sorted = [...phrases].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <Modal open={open} onClose={onClose} title="Saved">
      <div className="p-2">
        {sorted.length === 0 && (
          <p className="px-3 py-10 text-center text-sm text-stone-400">Nothing saved yet. Start one from the home screen.</p>
        )}
        <AnimatePresence initial={false}>
          {sorted.map((p) => (
            <Item
              key={p.id}
              phrase={p}
              onContinue={() => onContinue(p.id)}
              onReport={(sid) => onReport(p.id, sid)}
            />
          ))}
        </AnimatePresence>
      </div>
    </Modal>
  )
}

function Item({ phrase, onContinue, onReport }: { phrase: Phrase; onContinue: () => void; onReport: (sid: string) => void }) {
  const updatePhrase = useStore((s) => s.updatePhrase)
  const deletePhrase = useStore((s) => s.deletePhrase)
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm'>('view')
  const [text, setText] = useState(phrase.text)
  const [reps, setReps] = useState(phrase.reps)
  const last = phrase.sessions[phrase.sessions.length - 1]

  const save = () => {
    if (!text.trim()) return
    updatePhrase(phrase.id, { text: text.trim(), reps })
    setMode('view')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="mb-1 overflow-hidden rounded-xl px-3 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50"
    >
      {mode === 'edit' ? (
        <div className="space-y-2">
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-stone-300 bg-transparent p-2 text-sm outline-none focus:border-stone-500 dark:border-stone-700"
          />
          <div className="flex items-center justify-between gap-2">
            <RepsInput value={reps} onChange={setReps} />
            <div className="flex gap-1">
              <Button variant="ghost" onClick={() => setMode('view')}>Cancel</Button>
              <Button onClick={save} disabled={!text.trim()}>Save</Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="line-clamp-2 text-sm leading-relaxed">{phrase.text}</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-stone-400">
              ×{phrase.reps}
              {last ? ` · last score ${sessionScore(last)} · ${phrase.sessions.length} session${phrase.sessions.length > 1 ? 's' : ''}` : ' · not practised yet'}
            </span>
            {mode === 'confirm' ? (
              <div className="flex items-center gap-1">
                <span className="mr-1 text-xs text-stone-500">Delete for good?</span>
                <Button variant="ghost" className="px-2! py-1!" onClick={() => setMode('view')}>No</Button>
                <Button variant="danger" className="px-2! py-1!" onClick={() => deletePhrase(phrase.id)}>Delete</Button>
              </div>
            ) : (
              <div className="flex items-center gap-0.5">
                {last && (
                  <Button variant="ghost" className="px-2! py-1!" onClick={() => onReport(last.id)} title="Last report">
                    <BarChart3 className="size-3.5" />
                  </Button>
                )}
                <Button variant="ghost" className="px-2! py-1!" onClick={() => { setText(phrase.text); setReps(phrase.reps); setMode('edit') }} title="Edit">
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="ghost" className="px-2! py-1! hover:text-rose-600!" onClick={() => setMode('confirm')} title="Delete">
                  <Trash2 className="size-3.5" />
                </Button>
                <Button className="ml-1 px-2.5! py-1!" onClick={onContinue}>
                  <Play className="size-3.5" /> Continue
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}
