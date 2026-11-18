import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
export const modKey = isMac ? '⌘' : 'Ctrl'

const variants = {
  primary:
    'bg-stone-900 text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white disabled:opacity-40',
  ghost: 'text-stone-600 hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100',
  outline:
    'border border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800',
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      {...props}
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors active:scale-[0.98] disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    />
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-current/20 px-1 font-sans text-[11px] leading-4 opacity-70">{children}</kbd>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/40 p-4 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-label={title}
            className="flex max-h-[80dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-stone-900"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3.5 dark:border-stone-800">
              <h2 className="font-semibold">{title}</h2>
              <button onClick={onClose} className="cursor-pointer rounded-md p-1 text-stone-400 hover:text-stone-900 dark:hover:text-white" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function RepsInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const set = (n: number) => onChange(Math.min(100, Math.max(1, Number.isFinite(n) ? Math.round(n) : 1)))
  return (
    <div className="inline-flex items-center rounded-lg border border-stone-300 dark:border-stone-700">
      <button type="button" className="cursor-pointer px-2.5 py-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white" onClick={() => set(value - 1)} aria-label="Fewer">
        −
      </button>
      <input
        type="number"
        min={1}
        max={100}
        value={value}
        onChange={(e) => set(e.target.valueAsNumber)}
        className="w-10 bg-transparent text-center text-sm tabular-nums outline-none"
        aria-label="Repetitions"
      />
      <button type="button" className="cursor-pointer px-2.5 py-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white" onClick={() => set(value + 1)} aria-label="More">
        +
      </button>
    </div>
  )
}
