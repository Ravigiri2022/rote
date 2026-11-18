import { ArrowUpRight } from 'lucide-react'
import { about } from '../about'
import { PENALTY } from '../lib/scoring'
import { Modal } from './ui'

const steps = [
  'Paste or type a word, phrase or sentence and pick how many times to repeat it.',
  'Read it once. It hides as soon as you start typing.',
  'Type it from memory. A live diff shows what’s missing in red and what’s extra in green.',
  'Stuck? Press the eye to peek. It costs points, but that’s better than guessing.',
  'Finish each one with ⌘/Ctrl + Enter. At the end you get a report of every attempt.',
]

const penalties = [
  ['Spacing, punctuation, capitals', PENALTY.spacing],
  ['Spelling mistake', PENALTY.spelling],
  ['Wrong, missing or extra word', PENALTY.wrong],
  ['Peeking (once per attempt)', PENALTY.peek],
] as const

const linkClass =
  'inline-flex items-center gap-0.5 rounded-md text-sm font-medium underline decoration-stone-300 underline-offset-4 hover:decoration-stone-900 dark:decoration-stone-600 dark:hover:decoration-stone-100'

export default function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="About">
      <div className="space-y-6 px-5 py-5 text-sm leading-relaxed">
        <section>
          <h3 className="mb-1.5 font-semibold">The idea</h3>
          <p className="text-stone-600 dark:text-stone-400">
            At school we wrote things out 10, 20, 30 times until they stuck. It worked, but today most of what we
            learn comes from PDFs, ebooks and AI chats, with no pen and notebook in sight. Rote brings that habit back
            to the keyboard: type it from memory, see exactly what you got wrong, and repeat.
          </p>
        </section>

        <section>
          <h3 className="mb-1.5 font-semibold">How it works</h3>
          <ol className="list-decimal space-y-1 pl-5 text-stone-600 marker:text-stone-400 dark:text-stone-400">
            {steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>

        <section>
          <h3 className="mb-1.5 font-semibold">Scoring</h3>
          <p className="mb-2 text-stone-600 dark:text-stone-400">Every attempt starts at 100.</p>
          <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200 dark:divide-stone-800 dark:border-stone-800">
            {penalties.map(([label, pts]) => (
              <li key={label} className="flex justify-between px-3 py-1.5">
                <span>{label}</span>
                <span className="font-medium text-rose-600 tabular-nums dark:text-rose-400">−{pts}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-1.5 font-semibold">Your data</h3>
          <p className="text-stone-600 dark:text-stone-400">
            There’s no account and no server. Everything is stored only in this browser, so clearing site data or
            switching devices starts you fresh.
          </p>
        </section>

        <section className="border-t border-stone-100 pt-5 dark:border-stone-800">
          <h3 className="mb-1.5 font-semibold">Made by {about.name}</h3>
          {about.bio && <p className="mb-2 text-stone-600 dark:text-stone-400">{about.bio}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {[...about.links, ...(about.repo ? [{ label: 'Source code', href: about.repo }] : [])].map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={linkClass}>
                {l.label}
                <ArrowUpRight className="size-3.5" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  )
}
