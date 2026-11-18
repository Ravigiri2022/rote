export type IssueKind =
  | 'spacing'
  | 'punctuation'
  | 'capitalization'
  | 'spelling'
  | 'wrong'
  | 'missing'
  | 'extra'
  | 'peek'

export interface Issue {
  kind: IssueKind
  expected?: string
  got?: string
  count?: number
  points: number
}

export interface Attempt {
  typed: string
  score: number
  peeks: number
  issues: Issue[]
  durationMs: number
}

export interface Session {
  id: string
  startedAt: number
  /** Snapshot of the phrase text, so old reports survive later edits. */
  original: string
  attempts: Attempt[]
}

export interface Phrase {
  id: string
  text: string
  reps: number
  createdAt: number
  updatedAt: number
  sessions: Session[]
}
