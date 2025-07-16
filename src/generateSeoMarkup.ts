// src/generateSeoMarkup.ts
import type { SeoConfig, OpenGraph, TwitterCard } from './types'

/**
 * Generate a string of `<title>`, `<meta>`, and `<link>` tags
 * based on the provided SEO configuration.
 *
 * This utility is framework-agnostic and ideal for server-side
 * rendering or static HTML injection.
 *
 * @remarks
 * - Core tags (title, description, canonical, etc.)  
 * - Open Graph tags (`og:*`)  
 * - Twitter Card tags (`twitter:*`)  
 * - Extra `<meta>` and `<link>` entries
 *
 * @example
 * ```js
 * import { generateSeoMarkup } from 'react-seo'
 *
 * const head = generateSeoMarkup({
 *   title: 'My SSR Page',
 *   description: 'Hello from the server!',
 *   openGraph: { url: '/page', title: 'OG Title' },
 *   twitter:   { card: 'summary', title: 'Twitter Title' }
 * })
 *
 * // head:
 * // "<title>My SSR Page</title>\n<meta name="description" ...>\n..."
 * ```
 *
 * @param config - The SEO configuration object.
 * @returns A string of newline-separated head tags.
 */
export function generateSeoMarkup(config: SeoConfig): string {
  const tags: string[] = []

  /**
   * Helper to build a `<meta>` tag string from attributes.
   * @param attrs - Key/value pairs for meta attributes.
   */
  const m = (attrs: Record<string, string>): string =>
    `<meta ${Object.entries(attrs)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ')}>`
  
  /**
   * Helper to build a `<link>` tag string.
   * @param rel - The `rel` attribute (e.g., 'canonical', 'stylesheet').
   * @param href - The `href` URL or path.
   */
  const l = (rel: string, href: string): string =>
    `<link rel="${rel}" href="${href}">`

  // 1) Core tags
  if (config.title) {
    // <title> tag must come first for proper SEO
    tags.push(`<title>${config.title}</title>`)
  }
  if (config.description) {
    tags.push(m({ name: 'description', content: config.description }))
  }
  if (config.keywords) {
    tags.push(
      m({ name: 'keywords', content: config.keywords.join(',') })
    )
  }
  if (config.robots) {
    tags.push(m({ name: 'robots', content: config.robots }))
  }
  // ...viewport, themeColor, canonical, author, publisher, rating...
  if (config.viewport) {
    tags.push(m({ name: 'viewport', content: config.viewport }))
  }
  if (config.themeColor) {
    tags.push(m({ name: 'theme-color', content: config.themeColor }))
  }
  if (config.canonical) {
    tags.push(l('canonical', config.canonical))
  }
  if (config.author) {
    tags.push(m({ name: 'author', content: config.author }))
  }
  if (config.publisher) {
    tags.push(m({ name: 'publisher', content: config.publisher }))
  }
  if (config.rating) {
    tags.push(m({ name: 'rating', content: config.rating }))
  }
  if (config.revisitAfter) {
    tags.push(m({ name: 'revisit-after', content: config.revisitAfter }))
  }
  if (config.language) {
    tags.push(m({ name: 'language', content: config.language }))
  }

  // 2) Open Graph tags
  if (config.openGraph) {
    const og = config.openGraph as OpenGraph
    ;(Object.keys(og) as (keyof OpenGraph)[]).forEach(key => {
      const val = og[key]
      if (!val) return

      if (key === 'images' && Array.isArray(val)) {
        // Multiple images support
        val.forEach(img => {
          tags.push(m({ property: 'og:image', content: img.url }))
          if (img.alt) {
            tags.push(m({ property: 'og:image:alt', content: img.alt }))
          }
        })
      } else {
        // Standard OG property, e.g., og:title, og:url
        tags.push(m({ property: `og:${key}`, content: String(val) }))
      }
    })
  }

  // 3) Twitter Card tags
  if (config.twitter) {
    const tw = config.twitter as TwitterCard
    ;(Object.keys(tw) as (keyof TwitterCard)[]).forEach(key => {
      const val = tw[key]
      if (val) {
        tags.push(m({ name: `twitter:${key}`, content: String(val) }))
      }
    })
  }

  // 4) Extra meta tags
  config.extraMeta?.forEach(x => {
    // Distinguish 'name' vs 'property'
    if (x.name) {
      tags.push(m({ name: x.name, content: x.content }))
    } else if (x.property) {
      tags.push(m({ property: x.property, content: x.content }))
    }
  })

  // 5) Extra link tags
  config.extraLinks?.forEach(x => {
    tags.push(l(x.rel, x.href))
  })

  // Join with newlines for readability in injected HTML
  return tags.join('\n')
}



