import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, ChevronRight, Home, RotateCcw } from 'lucide-react'
import { sessionScore, useStore } from '../store'
import type { Attempt, Issue, IssueKind } from '../types'
import { DiffBlock } from './DiffView'
import { Button } from './ui'

interface Props {
  phraseId: string
  sessionId: string
  onHome: () => void
  onAgain: () => void
}

const LABEL: Record<IssueKind, string> = {
  spacing: 'Spacing',
  punctuation: 'Punctuation',
  capitalization: 'Capitalization',
  spelling: 'Spelling',
  wrong: 'Wrong word',
  missing: 'Missing word',
  extra: 'Extra word',
  peek: 'Peeked',
}

const show = (s: string) => `“${s.replace(/ /g, '␣').replace(/\n/g, '↵')}”`

function describe(i: Issue) {
  if (i.kind === 'peek') return `×${i.count}`
  if (!i.expected) return `added ${show(i.got!)}`
  if (!i.got) return `missing ${show(i.expected)}`
  return `${show(i.expected)} → ${show(i.got)}`
}

const fmtTime = (ms: number) => {
  const s = Math.round(ms / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
}

const barColor = (score: number) => (score === 100 ? 'bg-emerald-500' : score >= 80 ? 'bg-amber-400' : 'bg-rose-500')

export default function Report({ phraseId, sessionId, onHome, onAgain }: Props) {
  const phrase = useStore((s) => s.phrases.find((p) => p.id === phraseId))
  const session = phrase?.sessions.find((s) => s.id === sessionId)

  if (!session) {
    return (
      <div className="m-auto text-center">
        <p className="text-stone-500">That report no longer exists.</p>
        <Button className="mt-4" onClick={onHome}>Home</Button>
      </div>
    )
  }

  const { attempts, original } = session
  const correct = attempts.filter((a) => a.score === 100).length
  const peeks = attempts.reduce((n, a) => n + a.peeks, 0)
  const time = attempts.reduce((n, a) => n + a.durationMs, 0)
  const firstWrong = attempts.findIndex((a) => a.score < 100)

  const byKind = new Map<IssueKind, { count: number; points: number }>()
  for (const i of attempts.flatMap((a) => a.issues)) {
    const k = byKind.get(i.kind) ?? { count: 0, points: 0 }
    k.count += i.kind === 'peek' ? i.count ?? 1 : 1
    k.points += i.points
    byKind.set(i.kind, k)
  }

  const stats = [
    { label: 'Avg score', value: sessionScore(session) },
    { label: 'Correct', value: `${correct}/${attempts.length}` },
    { label: 'Peeks', value: peeks },
    { label: 'Time', value: fmtTime(time) },
  ]

  return (
    <>
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wide text-stone-400 uppercase">Report</p>
        <p className="mt-2 line-clamp-3 text-lg leading-relaxed">{original}</p>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="text-2xl font-semibold tabular-nums">{s.value}</div>
            <div className="text-xs text-stone-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Score per attempt */}
      <section className="mt-6">
        <h2 className="mb-2 text-xs font-medium text-stone-500">Score per attempt</h2>
        <div className="flex h-16 items-end gap-1">
          {attempts.map((a, i) => (
            <motion.div
              key={i}
              title={`#${i + 1}: ${a.score}`}
              className={`max-w-8 min-w-1 flex-1 rounded-t-sm ${barColor(a.score)}`}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(a.score, 4)}%` }}
              transition={{ delay: 0.15 + i * 0.03, type: 'spring', bounce: 0 }}
            />
          ))}
        </div>
      </section>

      {byKind.size > 0 && (
        <section className="mt-6 flex flex-wrap gap-1.5">
          {[...byKind].map(([kind, { count, points }]) => (
            <span key={kind} className="rounded-full bg-stone-200/70 px-2.5 py-1 text-xs dark:bg-stone-800">
              {LABEL[kind]} ×{count} <span className="text-rose-600 dark:text-rose-400">−{points}</span>
            </span>
          ))}
        </section>
      )}

      <section className="mt-8 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
        {attempts.map((a, i) => (
          <AttemptRow key={i} n={i + 1} attempt={a} original={original} defaultOpen={i === firstWrong} />
        ))}
      </section>

      <div className="mt-8 flex justify-center gap-2 pb-4">
        <Button variant="outline" onClick={onHome}><Home className="size-4" /> Home</Button>
        <Button onClick={onAgain}><RotateCcw className="size-4" /> Go again</Button>
      </div>
    </>
  )
}

function AttemptRow({ n, attempt, original, defaultOpen }: { n: number; attempt: Attempt; original: string; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const ok = attempt.score === 100

  if (ok) {
    return (
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span className="text-stone-500">Attempt {n}</span>
        <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4" /> Correct
        </span>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-sm">
        <span className="text-stone-500">Attempt {n}</span>
        <span className="flex items-center gap-2">
          <span className="font-medium text-rose-600 tabular-nums dark:text-rose-400">−{100 - attempt.score} pts</span>
          <motion.span animate={{ rotate: open ? 90 : 0 }}><ChevronRight className="size-4 text-stone-400" /></motion.span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <DiffBlock original={original} typed={attempt.typed} />
              <ul className="mt-3 space-y-1 text-sm">
                {attempt.issues.map((i, k) => (
                  <li key={k} className="flex justify-between gap-4">
                    <span className="min-w-0 break-words">
                      <span className="font-medium">{LABEL[i.kind]}</span>{' '}
                      <span className="font-mono text-xs text-stone-500">{describe(i)}</span>
                    </span>
                    <span className="shrink-0 font-medium text-rose-600 tabular-nums dark:text-rose-400">−{i.points}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
