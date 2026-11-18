import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { faq, site } from './src/content'

// Vercel exposes the production domain at build time; SITE_URL overrides it (e.g. a custom domain).
const siteUrl = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
).replace(/\/$/, '')

const meta = (attrs: Record<string, string>): HtmlTagDescriptor => ({ tag: 'meta', attrs, injectTo: 'head' })
const jsonLd = (data: object): HtmlTagDescriptor => ({
  tag: 'script',
  attrs: { type: 'application/ld+json' },
  children: JSON.stringify(data),
  injectTo: 'head',
})

/** Adds the URL-dependent SEO tags plus robots.txt and sitemap.xml. */
function seo(): Plugin {
  return {
    name: 'seo',
    transformIndexHtml(html) {
      html = html.replaceAll('%SITE_TITLE%', site.title).replaceAll('%SITE_DESCRIPTION%', site.description)
      const tags: HtmlTagDescriptor[] = [
        jsonLd({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        }),
      ]
      if (!siteUrl) return { html, tags }
      tags.push(
        { tag: 'link', attrs: { rel: 'canonical', href: `${siteUrl}/` }, injectTo: 'head' },
        meta({ property: 'og:url', content: `${siteUrl}/` }),
        meta({ property: 'og:image', content: `${siteUrl}/og.png` }),
        meta({ name: 'twitter:image', content: `${siteUrl}/og.png` }),
        jsonLd({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: site.name,
          url: `${siteUrl}/`,
          description: site.description,
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Any',
          browserRequirements: 'Requires JavaScript',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          author: { '@type': 'Person', name: site.author, url: 'https://github.com/Ravigiri2022' },
        }),
      )
      return { html, tags }
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', ...(siteUrl ? [`Sitemap: ${siteUrl}/sitemap.xml`] : [])]
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') + '\n' })
      if (!siteUrl) return
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>
</urlset>
`,
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seo()],
})
