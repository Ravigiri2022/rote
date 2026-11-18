import { describe, expect, it } from 'vitest'
import { liveDiff, livePrefix } from './diff'
import { scoreAttempt } from './scoring'

const kinds = (original: string, typed: string, peeks = 0) =>
  scoreAttempt(original, typed, peeks).issues.map((i) => i.kind)

describe('scoreAttempt', () => {
  const s = 'The quick brown fox jumps over the lazy dog.'

  it('perfect copy scores 100', () => {
    expect(scoreAttempt(s, s, 0)).toEqual({ score: 100, issues: [] })
  })

  it('minor issues cost 1 each', () => {
    expect(kinds(s, 'the quick brown fox jumps over the lazy dog.')).toEqual(['capitalization'])
    expect(kinds(s, 'The quick brown fox jumps over the lazy dog')).toEqual(['punctuation'])
    expect(kinds(s, 'The quick  brown fox jumps over the lazy dog.')).toEqual(['spacing'])
    expect(scoreAttempt(s, 'The quick brown fox jumps over the lazy dog', 0).score).toBe(99)
  })

  it('typos are spelling, different words are wrong', () => {
    expect(kinds(s, 'The quikc brown fox jumps over the lazy dog.')).toEqual(['spelling'])
    expect(kinds(s, 'The fast brown fox jumps over the lazy dog.')).toEqual(['wrong'])
  })

  it('missing and extra words', () => {
    expect(kinds(s, 'The brown fox jumps over the lazy dog.')).toEqual(['missing'])
    expect(kinds(s, 'The quick brown fox jumps over the very lazy dog.')).toEqual(['extra'])
  })

  it('peeking costs once per attempt', () => {
    expect(scoreAttempt(s, s, 3).score).toBe(90)
  })

  it('never goes below zero', () => {
    expect(scoreAttempt('cat', 'a b c d e f g h i j k l m n o p q r s t u', 2).score).toBe(0)
  })
})

describe('live diff', () => {
  const s = 'The quick brown fox'

  it('does not mark unreached text as missing', () => {
    expect(livePrefix(s, 'The qu')).toBe('The qu')
    expect(livePrefix(s, 'The quick ')).toBe('The quick ')
    expect(liveDiff(s, 'The quick')).toEqual([{ text: 'The quick', type: 'eq' }])
  })

  it('shows a typo in the current word', () => {
    const segs = liveDiff(s, 'The quikc ')
    expect(segs.some((x) => x.type === 'del')).toBe(true)
    expect(segs.some((x) => x.type === 'ins')).toBe(true)
    expect(segs.map((x) => (x.type === 'ins' ? '' : x.text)).join('')).toBe('The quick ')
  })

  it('shows a skipped word as missing', () => {
    expect(liveDiff(s, 'The brown ')).toEqual([
      { text: 'The ', type: 'eq' },
      { text: 'quick ', type: 'del' },
      { text: 'brown ', type: 'eq' },
    ])
  })
})
