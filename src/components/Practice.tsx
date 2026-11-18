import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Eye, EyeOff, X } from 'lucide-react'
import { liveDiff } from '../lib/diff'
import { scoreAttempt } from '../lib/scoring'
import { uid, useStore } from '../store'
import type { Attempt } from '../types'
import { LiveDiff } from './DiffView'
import { Button, Kbd, modKey } from './ui'

interface Props {
  phraseId: string
  onExit: () => void
  onDone: (sessionId: string) => void
}

export default function Practice({ phraseId, onExit, onDone }: Props) {
  const phrase = useStore((s) => s.phrases.find((p) => p.id === phraseId))
  const addSession = useStore((s) => s.addSession)
  const [original] = useState(() => phrase?.text ?? '')
  const reps = phrase?.reps ?? 1

  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [typed, setTyped] = useState('')
  // The phrase is shown once up front and hides on the first keystroke; after that, revealing it is a peek.
  const [studying, setStudying] = useState(true)
  const [revealed, setRevealed] = useState(true)
  const [peeks, setPeeks] = useState(0)
  const [flash, setFlash] = useState<{ id: number; score: number } | null>(null)
  const [ghost, setGhost] = useState<{ id: number; text: string } | null>(null)

  const startedAt = useRef(Date.now())
  const attemptStart = useRef<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const deferred = useDeferredValue(typed)
  const segments = useMemo(() => liveDiff(original, deferred), [original, deferred])
  const masked = useMemo(() => original.replace(/\S/g, '•'), [original])

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 1600)
    return () => clearTimeout(t)
  }, [flash])

  if (!phrase) return null

  const type = (v: string) => {
    attemptStart.current ??= Date.now()
    setStudying(false)
    setRevealed(false)
    setTyped(v)
  }

  const toggleEye = () => {
    if (!revealed && !studying) setPeeks((n) => n + 1)
    setRevealed(!revealed)
    inputRef.current?.focus()
  }

  const finish = (list: Attempt[]) => {
    const session = { id: uid(), startedAt: startedAt.current, original, attempts: list }
    addSession(phraseId, session)
    onDone(session.id)
  }

  const submit = () => {
    if (!typed.trim()) return
    const { score, issues } = scoreAttempt(original, typed, peeks)
    const attempt: Attempt = {
      typed,
      score,
      peeks,
      issues,
      durationMs: Date.now() - (attemptStart.current ?? Date.now()),
    }
    const next = [...attempts, attempt]
    setAttempts(next)
    setGhost({ id: next.length, text: typed })
    setFlash({ id: next.length, score })
    setTyped('')
    setPeeks(0)
    setRevealed(false)
    attemptStart.current = null
    inputRef.current?.focus()
    if (next.length >= reps) finish(next)
  }

  const done = attempts.length

  return (
    <>
      <header className="mb-10 flex items-center gap-4">
        <Button variant="ghost" className="-ml-2 px-2!" onClick={onExit} title="Quit without saving">
          <X className="size-4" />
        </Button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
          <motion.div
            className="h-full rounded-full bg-stone-900 dark:bg-stone-100"
            animate={{ width: `${(done / reps) * 100}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          />
        </div>
        <div className="relative w-16 text-right text-sm tabular-nums text-stone-500">
          <AnimatePresence>
            {flash && (
              <motion.span
                key={flash.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`absolute right-0 -top-6 whitespace-nowrap text-xs font-medium ${flash.score === 100 ? 'text-emerald-600' : 'text-amber-600'}`}
              >
                {flash.score === 100 ? '✓ correct' : `−${100 - flash.score} pts`}
              </motion.span>
            )}
          </AnimatePresence>
          {Math.min(done + 1, reps)} / {reps}
        </div>
      </header>

      {/* The phrase, hidden behind dots until the eye is pressed */}
      <div className="flex items-start gap-3">
        <div className="relative min-w-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={revealed ? 'shown' : 'hidden'}
              initial={{ opacity: 0, filter: 'blur(6px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(6px)' }}
              transition={{ duration: 0.18 }}
              className={`text-xl leading-relaxed break-words whitespace-pre-wrap ${revealed ? '' : 'tracking-widest text-stone-300 select-none dark:text-stone-600'}`}
            >
              {revealed ? original : masked}
            </motion.p>
          </AnimatePresence>
        </div>
        <button
          onClick={toggleEye}
          className="mt-1 cursor-pointer rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-200/70 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-white"
          title={revealed ? 'Hide' : 'Show (counts as a peek)'}
          aria-label={revealed ? 'Hide phrase' : 'Show phrase'}
        >
          {revealed ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
      <p className="mt-2 h-4 text-xs text-stone-400">
        {studying ? 'Read it, then start typing. It hides as soon as you do.' : peeks > 0 ? `Peeked ${peeks}× this time` : ''}
      </p>

      {/* Typing area */}
      <div className="relative mt-6">
        <AnimatePresence>
          {ghost && (
            <motion.div
              key={ghost.id}
              initial={{ opacity: 0.8, y: 0 }}
              animate={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              onAnimationComplete={() => setGhost(null)}
              className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4 pr-16 text-lg leading-relaxed whitespace-pre-wrap"
            >
              {ghost.text}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-stretch gap-2 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm transition-shadow focus-within:shadow-md dark:border-stone-800 dark:bg-stone-900">
          <textarea
            ref={inputRef}
            autoFocus
            value={typed}
            onChange={(e) => type(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                submit()
              }
            }}
            rows={3}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="Type it from memory…"
            className="min-w-0 flex-1 resize-none bg-transparent p-2 text-lg leading-relaxed outline-none placeholder:text-stone-400"
          />
          <Button onClick={submit} disabled={!typed.trim()} className="flex-col self-stretch px-3!" title={`Done (${modKey}+Enter)`}>
            <Check className="size-5" />
            <Kbd>{modKey}↵</Kbd>
          </Button>
        </div>
      </div>

      {/* Live diff */}
      <div className="mt-4 min-h-20 rounded-xl border border-dashed border-stone-200 px-4 py-3 dark:border-stone-800">
        <div className="mb-1 flex items-center gap-3 text-[11px] font-medium tracking-wide text-stone-400 uppercase">
          Live diff
          <span className="flex items-center gap-1 normal-case"><i className="size-2 rounded-sm bg-rose-300" /> missing</span>
          <span className="flex items-center gap-1 normal-case"><i className="size-2 rounded-sm bg-emerald-300" /> added</span>
        </div>
        {segments.length ? (
          <LiveDiff segments={segments} />
        ) : (
          <p className="text-sm text-stone-400">Your differences show up here as you type.</p>
        )}
      </div>

      {done > 0 && (
        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => finish(attempts)}>
            Finish early & see report
          </Button>
        </div>
      )}
    </>
  )
}
