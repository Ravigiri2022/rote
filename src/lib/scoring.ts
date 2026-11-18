import { diffArrays } from 'diff'
import type { Issue, IssueKind } from '../types'
import { similarity, wordHunks } from './diff'

/** Points taken off per issue. Tweak freely. */
export const PENALTY: Record<IssueKind, number> = {
  spacing: 1,
  punctuation: 1,
  capitalization: 1,
  spelling: 3,
  wrong: 5,
  missing: 5,
  extra: 5,
  peek: 10,
}

/** A swapped word at least this similar to the original counts as a typo, not a wrong word. */
const SPELLING_SIMILARITY = 0.6

const letters = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, '')
const punctuation = (s: string) => s.replace(/[\p{L}\p{N}\s]/gu, '')
const whitespace = (s: string) => s.replace(/\S/g, '')
const words = (s: string) => s.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []

const issue = (kind: IssueKind, expected?: string, got?: string): Issue => ({
  kind,
  expected,
  got,
  points: PENALTY[kind],
})

export function findIssues(original: string, typed: string): Issue[] {
  const issues: Issue[] = []
  for (const { removed, added } of wordHunks(original, typed)) {
    if (letters(removed).toLowerCase() === letters(added).toLowerCase()) {
      // Same letters: only cosmetic differences.
      if (letters(removed) !== letters(added)) issues.push(issue('capitalization', removed, added))
      if (punctuation(removed) !== punctuation(added)) issues.push(issue('punctuation', removed, added))
      if (whitespace(removed) !== whitespace(added)) issues.push(issue('spacing', removed, added))
      continue
    }
    const dels: string[] = []
    const inss: string[] = []
    for (const c of diffArrays(words(removed), words(added))) {
      if (c.removed) dels.push(...c.value)
      else if (c.added) inss.push(...c.value)
    }
    const paired = Math.min(dels.length, inss.length)
    for (let i = 0; i < paired; i++) {
      const [a, b] = [dels[i], inss[i]]
      const typo = Math.max(a.length, b.length) >= 3 && similarity(a, b) >= SPELLING_SIMILARITY
      issues.push(issue(typo ? 'spelling' : 'wrong', a, b))
    }
    for (const w of dels.slice(paired)) issues.push(issue('missing', w))
    for (const w of inss.slice(paired)) issues.push(issue('extra', undefined, w))
  }
  return issues
}

export function scoreAttempt(original: string, typed: string, peeks: number) {
  const issues = findIssues(original, typed)
  if (peeks > 0) issues.push({ kind: 'peek', count: peeks, points: PENALTY.peek })
  const lost = issues.reduce((sum, i) => sum + i.points, 0)
  return { score: Math.max(0, 100 - lost), issues }
}
