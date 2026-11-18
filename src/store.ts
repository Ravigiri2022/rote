import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Phrase, Session } from './types'

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

interface State {
  phrases: Phrase[]
  addPhrase: (text: string, reps: number) => string
  updatePhrase: (id: string, patch: Pick<Phrase, 'text' | 'reps'>) => void
  deletePhrase: (id: string) => void
  addSession: (id: string, session: Session) => void
}

const touch = (phrases: Phrase[], id: string, fn: (p: Phrase) => Partial<Phrase>) =>
  phrases.map((p) => (p.id === id ? { ...p, ...fn(p), updatedAt: Date.now() } : p))

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      phrases: [],
      addPhrase: (text, reps) => {
        const existing = get().phrases.find((p) => p.text === text)
        if (existing) {
          set((s) => ({ phrases: touch(s.phrases, existing.id, () => ({ reps })) }))
          return existing.id
        }
        const now = Date.now()
        const phrase: Phrase = { id: uid(), text, reps, createdAt: now, updatedAt: now, sessions: [] }
        set((s) => ({ phrases: [phrase, ...s.phrases] }))
        return phrase.id
      },
      updatePhrase: (id, patch) => set((s) => ({ phrases: touch(s.phrases, id, () => patch) })),
      deletePhrase: (id) => set((s) => ({ phrases: s.phrases.filter((p) => p.id !== id) })),
      addSession: (id, session) =>
        set((s) => ({ phrases: touch(s.phrases, id, (p) => ({ sessions: [...p.sessions, session] })) })),
    }),
    { name: 'rote-v1' },
  ),
)

export const sessionScore = (s: Session) =>
  s.attempts.length ? Math.round(s.attempts.reduce((sum, a) => sum + a.score, 0) / s.attempts.length) : 0
