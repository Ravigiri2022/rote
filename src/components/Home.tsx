import { useState } from 'react'
import { Bookmark, ChevronDown, Info, PenLine } from 'lucide-react'
import { about } from '../about'
import { faq, features } from '../content'
import { useStore } from '../store'
import AboutModal from './AboutModal'
import SavedModal from './SavedModal'
import { Button, Kbd, RepsInput, modKey } from './ui'

interface Props {
  onStart: (phraseId: string) => void
  onReport: (phraseId: string, sessionId: string) => void
}

export default function Home({ onStart, onReport }: Props) {
  const count = useStore((s) => s.phrases.length)
  const addPhrase = useStore((s) => s.addPhrase)
  const [text, setText] = useState('')
  const [reps, setReps] = useState(10)
  const [savedOpen, setSavedOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)

  const start = () => {
    const t = text.trim()
    if (t) onStart(addPhrase(t, reps))
  }

  return (
    <>
      <header className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenLine className="size-5" />
          <span className="text-lg font-semibold tracking-tight">Rote</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" onClick={() => setAboutOpen(true)}>
            <Info className="size-4" />
            About
          </Button>
          <Button variant="ghost" onClick={() => setSavedOpen(true)}>
            <Bookmark className="size-4" />
            Saved
            {count > 0 && (
              <span className="rounded-full bg-stone-200 px-1.5 text-xs tabular-nums dark:bg-stone-800">{count}</span>
            )}
          </Button>
        </div>
      </header>

      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Write it until it sticks.</h1>
      <p className="mt-2 text-stone-500">
        A free memorization tool, like writing lines at school. Paste a word, definition or quote, then type it from
        memory again and again.
      </p>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm transition-shadow focus-within:shadow-md dark:border-stone-800 dark:bg-stone-900">
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              start()
            }
          }}
          rows={4}
          placeholder="Paste or type what you want to remember…"
          className="block w-full resize-none bg-transparent p-3 text-lg leading-relaxed outline-none placeholder:text-stone-400"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 px-2 pt-2 dark:border-stone-800">
          <label className="flex items-center gap-2 text-sm text-stone-500">
            Repeat
            <RepsInput value={reps} onChange={setReps} />
            times
          </label>
          <Button onClick={start} disabled={!text.trim()}>
            Start <Kbd>{modKey} ↵</Kbd>
          </Button>
        </div>
      </div>

      <section className="mt-20" aria-labelledby="features">
        <h2 id="features" className="text-xl font-semibold tracking-tight">Memorize anything by typing it out</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-stone-200 p-4 dark:border-stone-800">
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="faq">
        <h2 id="faq" className="text-xl font-semibold tracking-tight">Questions</h2>
        <div className="mt-3 divide-y divide-stone-200 border-y border-stone-200 dark:divide-stone-800 dark:border-stone-800">
          {faq.map(({ q, a }) => (
            <details key={q} className="group py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                {q}
                <ChevronDown className="size-4 shrink-0 text-stone-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="mt-auto pt-14 text-center text-xs text-stone-400">
        Everything is saved only in this browser. Nothing leaves your device. ·{' '}
        <a href={about.repo} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-stone-600">
          Source on GitHub
        </a>
      </footer>

      <SavedModal
        open={savedOpen}
        onClose={() => setSavedOpen(false)}
        onContinue={onStart}
        onReport={onReport}
      />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  )
}
