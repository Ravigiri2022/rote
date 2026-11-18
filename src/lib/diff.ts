import { diffChars, diffWordsWithSpace } from 'diff'

export type SegType = 'eq' | 'del' | 'ins'
export interface Segment {
  text: string
  type: SegType
}
export interface Hunk {
  removed: string
  added: string
}

type Change = { value: string; added?: boolean; removed?: boolean }

const toSegments = (changes: Change[]): Segment[] =>
  changes.map((c) => ({ text: c.value, type: c.added ? 'ins' : c.removed ? 'del' : 'eq' }))

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = cur
  }
  return prev[b.length]
}

export function similarity(a: string, b: string): number {
  const max = Math.max(a.length, b.length)
  return max === 0 ? 1 : 1 - levenshtein(a, b) / max
}

function merge(segs: Segment[]): Segment[] {
  const out: Segment[] = []
  for (const s of segs) {
    if (!s.text) continue
    const last = out[out.length - 1]
    if (last && last.type === s.type) last.text += s.text
    else out.push({ ...s })
  }
  return out
}

// A replaced word that's close to the original gets a letter-level diff, so only the typo lights up.
const refinable = (a: string, b: string) =>
  !/\s/.test(a) && !/\s/.test(b) && similarity(a.toLowerCase(), b.toLowerCase()) >= 0.5

/** Word-level diff for display, refined to characters inside near-miss words. */
export function diffText(original: string, typed: string): Segment[] {
  const segs = toSegments(diffWordsWithSpace(original, typed))
  const out: Segment[] = []
  for (let i = 0; i < segs.length; i++) {
    const a = segs[i]
    const b = segs[i + 1]
    if (a.type === 'del' && b?.type === 'ins' && refinable(a.text, b.text)) {
      out.push(...toSegments(diffChars(a.text, b.text)))
      i++
    } else {
      out.push(a)
    }
  }
  return merge(out)
}

/** Raw word-level change groups, used for scoring. */
export function wordHunks(original: string, typed: string): Hunk[] {
  const hunks: Hunk[] = []
  let cur: Hunk | null = null
  for (const c of diffWordsWithSpace(original, typed)) {
    if (!c.added && !c.removed) {
      cur = null
      continue
    }
    if (!cur) hunks.push((cur = { removed: '', added: '' }))
    if (c.added) cur.added += c.value
    else cur.removed += c.value
  }
  return hunks
}

/**
 * The part of the original the user has "reached" while typing, so text they
 * haven't got to yet isn't shown as missing. Picks the word boundary near the
 * typed word count that diffs cheapest, trimming a half-typed last word.
 */
export function livePrefix(original: string, typed: string): string {
  const words = [...original.matchAll(/\S+/g)]
  const typedWords = typed.match(/\S+/g) ?? []
  const n = typedWords.length
  const endsInSpace = /\s$/.test(typed)
  const lastTyped = (typedWords[n - 1] ?? '').toLowerCase()

  let best = ''
  let bestCost = Infinity
  // Cost = changed chars + a pull towards the typed word count; ties go to the longer prefix.
  for (let j = Math.max(0, n - 6); j <= Math.min(words.length, n + 6); j++) {
    let prefix = ''
    if (j > 0) {
      const w = words[j - 1]
      const start = w.index!
      const end = start + w[0].length
      if (endsInSpace) {
        prefix = original.slice(0, end + original.slice(end).match(/^\s*/)![0].length)
      } else if (lastTyped && w[0].toLowerCase().startsWith(lastTyped)) {
        prefix = original.slice(0, start + lastTyped.length)
      } else {
        prefix = original.slice(0, end)
      }
    }
    const changed = diffChars(prefix, typed).reduce((sum, c) => sum + (c.added || c.removed ? c.value.length : 0), 0)
    const cost = changed + 3 * Math.abs(j - n)
    if (cost <= bestCost) {
      best = prefix
      bestCost = cost
    }
  }
  return best
}

export function liveDiff(original: string, typed: string): Segment[] {
  if (!typed) return []
  return diffText(livePrefix(original, typed), typed)
}
