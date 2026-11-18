/**
 * Copy shared by the page and the build-time SEO tags (vite.config.ts),
 * so the structured data Google reads always matches what's on screen.
 */
export const site = {
  name: 'Rote',
  title: 'Rote: Memorize Words, Definitions & Quotes by Typing Them Out',
  description:
    'A free memorization tool for students. Type a word, definition, formula or quote from memory again and again, see every mistake in a live diff, and track your score. No sign-up.',
  author: 'Ravigiri2022',
}

export const features = [
  {
    title: 'Active recall, not rereading',
    body: 'The text hides as soon as you start typing, so you have to pull it from memory. That effort is what makes it stick.',
  },
  {
    title: 'See every mistake as you type',
    body: 'A git-style diff marks missing words in red and extra ones in green, down to the swapped letter in a typo.',
  },
  {
    title: 'A report for every session',
    body: 'Spacing slips cost 1 point, typos 3, wrong or missing words 5. Each attempt shows exactly where the points went.',
  },
]

export const faq = [
  {
    q: 'What can I memorize with Rote?',
    a: 'Anything you can type: vocabulary, definitions, formulas, dates, quotes, poems, speeches, legal or medical terms, and lines from a script. It works for school, university, language learning and exam revision.',
  },
  {
    q: 'Does typing something out really help you remember it?',
    a: 'Recalling something from memory, rather than rereading it, is one of the best-studied ways to make learning last (known as retrieval practice). Rote makes you recall the text every repetition and shows exactly what you got wrong, so you can fix it on the next try.',
  },
  {
    q: 'Is Rote free? Do I need an account?',
    a: 'Yes, it is free, and there is no account or sign-up. Open the page and start typing.',
  },
  {
    q: 'Where is my data stored?',
    a: 'Only in your own browser. Nothing is sent to a server. Clearing your browser data or switching devices starts you fresh.',
  },
  {
    q: 'How is the score calculated?',
    a: 'Every attempt starts at 100. Spacing, punctuation and capital-letter slips cost 1 point, spelling mistakes 3, wrong, missing or extra words 5, and peeking at the answer 10.',
  },
]
