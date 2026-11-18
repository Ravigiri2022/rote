# Rote

Remember words, phrases and sentences by typing them out from memory, again and again.

At school we wrote things out 10, 20, 30 times until they stuck. Today most of what we learn comes from PDFs, ebooks and AI chats, without a pen or notebook. Rote brings that habit back to the keyboard.

## How it works

1. Paste or type what you want to remember and choose how many times to repeat it.
2. Read it once. It hides as soon as you start typing.
3. Type it from memory. A live, git-style diff shows what's missing (red) and what you added (green).
4. Stuck? Press the eye icon to peek. Peeking costs points.
5. Finish each attempt with <kbd>⌘/Ctrl</kbd> + <kbd>Enter</kbd> or the ✓ button.
6. At the end, the report shows a ✓ for every correct attempt. Each attempt that lost points opens to a VS Code-style diff and a list of the deductions.

## Scoring

Every attempt starts at 100.

| Mistake | Points |
| --- | --- |
| Spacing, punctuation or capital letters | −1 |
| Spelling (the word is close to the right one) | −3 |
| Wrong, missing or extra word | −5 |
| Peeking (once per attempt) | −10 |

You can change the values in [`src/lib/scoring.ts`](src/lib/scoring.ts).

## Your data

There's no backend and no account. Phrases and reports are stored in your browser's `localStorage`, so clearing site data or switching devices starts you fresh.

## Running it

```bash
npm install
npm run dev      # start the dev server
npm test         # run the scoring and diff tests
npm run build    # production build in dist/
```

## Deploying to Vercel

Import the repo in Vercel; it detects Vite automatically, so no settings are needed.

The build adds the canonical URL, social-share image tags, `sitemap.xml` and structured data using the production domain Vercel provides. If you use a custom domain, add an environment variable `SITE_URL` (for example `https://rote.app`) so those point at it instead.

Built with Vite, React, TypeScript, Tailwind CSS, Motion, jsdiff, Zustand and Lucide icons.
