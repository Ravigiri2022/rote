import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Home from './components/Home'
import Practice from './components/Practice'
import Report from './components/Report'

export type View =
  | { name: 'home' }
  | { name: 'practice'; phraseId: string }
  | { name: 'report'; phraseId: string; sessionId: string }

export default function App() {
  const [view, setView] = useState<View>({ name: 'home' })
  const home = () => setView({ name: 'home' })
  const practice = (phraseId: string) => setView({ name: 'practice', phraseId })
  const report = (phraseId: string, sessionId: string) => setView({ name: 'report', phraseId, sessionId })

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-8 sm:py-14">
      <AnimatePresence mode="wait">
        <motion.main
          key={view.name === 'report' ? view.sessionId : view.name}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex flex-1 flex-col"
        >
          {view.name === 'home' && <Home onStart={practice} onReport={report} />}
          {view.name === 'practice' && (
            <Practice phraseId={view.phraseId} onExit={home} onDone={(sid) => report(view.phraseId, sid)} />
          )}
          {view.name === 'report' && (
            <Report
              phraseId={view.phraseId}
              sessionId={view.sessionId}
              onHome={home}
              onAgain={() => practice(view.phraseId)}
            />
          )}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
