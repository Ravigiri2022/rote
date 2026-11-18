import type { ReactNode } from 'react'
import type { Segment } from '../lib/diff'
import { diffText } from '../lib/diff'

const mark = {
  del: 'rounded-sm bg-rose-200 text-rose-900 dark:bg-rose-500/40 dark:text-rose-50',
  ins: 'rounded-sm bg-emerald-200 text-emerald-900 dark:bg-emerald-500/40 dark:text-emerald-50',
}

/** Inline diff while typing: missing text struck through in red, additions in green. */
export function LiveDiff({ segments }: { segments: Segment[] }) {
  return (
    <p className="font-mono text-[15px] leading-7 break-words whitespace-pre-wrap">
      {segments.map((s, i) =>
        s.type === 'eq' ? (
          <span key={i}>{s.text}</span>
        ) : (
          <span key={i} className={`${mark[s.type]} ${s.type === 'del' ? 'line-through decoration-rose-500/60' : ''}`}>
            {s.text}
          </span>
        ),
      )}
    </p>
  )
}

function Line({ sign, tone, children }: { sign: string; tone: string; children: ReactNode }) {
  return (
    <div className={`flex ${tone}`}>
      <span className="w-7 shrink-0 select-none py-1 text-center opacity-60">{sign}</span>
      <span className="min-w-0 flex-1 py-1 pr-3 break-words whitespace-pre-wrap">{children}</span>
    </div>
  )
}

/** VS Code-style block: original on top, then the − / + lines with changed spans highlighted. */
export function DiffBlock({ original, typed }: { original: string; typed: string }) {
  const segments = diffText(original, typed)
  const side = (hide: 'del' | 'ins') =>
    segments
      .filter((s) => s.type !== hide)
      .map((s, i) => (s.type === 'eq' ? <span key={i}>{s.text}</span> : <span key={i} className={mark[s.type]}>{s.text}</span>))

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 font-mono text-[13px] leading-6 dark:border-stone-800">
      <Line sign="" tone="bg-stone-50 text-stone-600 dark:bg-stone-900 dark:text-stone-400">{original}</Line>
      <Line sign="−" tone="bg-rose-50 text-rose-950 dark:bg-rose-950/40 dark:text-rose-100">{side('ins')}</Line>
      <Line sign="+" tone="bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100">{side('del')}</Line>
    </div>
  )
}
