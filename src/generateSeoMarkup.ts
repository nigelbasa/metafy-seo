// src/generateSeoMarkup.ts
import type { SeoConfig, OpenGraph, TwitterCard } from './types'
import { escapeHtml } from './utils'

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
 * - All content is HTML escaped for security
 *
 * @example
 * ```js
 * import { generateSeoMarkup } from 'metafy-seo'
 *
 * const head = generateSeoMarkup({
 *   title: 'My SSR Page',
 *   description: 'Hello from the server!',
 *   openGraph: { url: '/page', title: 'OG Title' },
 *   twitter:   { card: 'summary', title: 'Twitter Title' }
 * })
 * ```
 *
 * @param config - The SEO configuration object.
 * @returns A string of newline-separated head tags.
 */
export function generateSeoMarkup(config: SeoConfig): string {
  const tags: string[] = []

  /**
   * Helper to build a `<meta>` tag string from attributes.
   * All content values are HTML escaped for security.
   */
  const m = (attrs: Record<string, string>): string => {
    const escaped = Object.fromEntries(
      Object.entries(attrs).map(([k, v]) => [k, escapeHtml(v)])
    )
    return `<meta ${Object.entries(escaped)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ')}>`
  }

  /**
   * Helper to build a `<link>` tag string.
   * @param rel - The `rel` attribute (e.g., 'canonical', 'stylesheet').
   * @param href - The `href` URL or path.
   * @param extraAttrs - Optional additional attributes
   */
  const l = (rel: string, href: string, extraAttrs: Record<string, string> = {}): string => {
    const escapedHref = escapeHtml(href)
    const extras = Object.entries(extraAttrs)
      .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
      .join(' ')
    return `<link rel="${escapeHtml(rel)}" href="${escapedHref}"${extras ? ' ' + extras : ''}>`
  }

  // 1) Core tags
  // Title with template support
  if (config.title) {
    const titleText = config.titleTemplate
      ? config.titleTemplate.replace('%s', config.title)
      : config.title
    tags.push(`<title>${escapeHtml(titleText)}</title>`)
  }

  if (config.description) {
    tags.push(m({ name: 'description', content: config.description }))
  }

  // Robots meta tag handling: noindex/nofollow take precedence
  let robotsContent = config.robots
  const noindex = config.noindex === true
  const nofollow = config.nofollow === true

  if (noindex && nofollow) {
    robotsContent = 'noindex,nofollow'
  } else if (noindex) {
    robotsContent = 'noindex'
  } else if (nofollow) {
    robotsContent = 'nofollow'
  }

  if (robotsContent) {
    tags.push(m({ name: 'robots', content: robotsContent }))
  }

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
  if (config.language) {
    tags.push(m({ name: 'language', content: config.language }))
  }

  // Site Verification
  if (config.siteVerification) {
    if (config.siteVerification.google) {
      tags.push(m({ name: 'google-site-verification', content: config.siteVerification.google }))
    }
    if (config.siteVerification.bing) {
      tags.push(m({ name: 'msvalidate.01', content: config.siteVerification.bing }))
    }
    if (config.siteVerification.yandex) {
      tags.push(m({ name: 'yandex-verification', content: config.siteVerification.yandex }))
    }
    if (config.siteVerification.pinterest) {
      tags.push(m({ name: 'p:domain_verify', content: config.siteVerification.pinterest }))
    }
  }

  // Facebook App ID
  if (config.facebook?.appId) {
    tags.push(m({ property: 'fb:app_id', content: config.facebook.appId }))
  }

  // Language Alternates (hreflang)
  if (config.languageAlternates) {
    Object.entries(config.languageAlternates).forEach(([lang, href]) => {
      tags.push(`<link rel="alternate" hreflang="${escapeHtml(lang)}" href="${escapeHtml(href)}">`)
    })
  }

  // Icons
  if (config.icons) {
    if (config.icons.icon) {
      tags.push(l('icon', config.icons.icon))
    }
    if (config.icons.apple) {
      tags.push(l('apple-touch-icon', config.icons.apple))
    }
    if (config.icons.mask) {
      const { url, color } = config.icons.mask
      tags.push(l('mask-icon', url, { color: color || '#000000' }))
    }
    if (config.icons.manifest) {
      tags.push(l('manifest', config.icons.manifest))
    }
  }

  // 2) Open Graph tags
  if (config.openGraph) {
    const og = config.openGraph as OpenGraph
      ; (Object.keys(og) as (keyof OpenGraph)[]).forEach(key => {
        const val = og[key]
        if (!val) return

        if (key === 'images' && Array.isArray(val)) {
          val.forEach(img => {
            tags.push(m({ property: 'og:image', content: img.url }))
            if (img.alt) tags.push(m({ property: 'og:image:alt', content: img.alt }))
            if (img.width) tags.push(m({ property: 'og:image:width', content: String(img.width) }))
            if (img.height) tags.push(m({ property: 'og:image:height', content: String(img.height) }))
            if (img.type) tags.push(m({ property: 'og:image:type', content: img.type }))
          })
        } else if (typeof val === 'object') {
          // Handle nested OG objects (article, book, profile, video)
          const prefix = `og:${key}`
          const valObj = val as Record<string, unknown>
            ; (Object.keys(valObj)).forEach(nestedKey => {
              const nestedVal = valObj[nestedKey]
              if (!nestedVal) return

              if (Array.isArray(nestedVal)) {
                ; (nestedVal as unknown[]).forEach((item: unknown) => {
                  if (typeof item === 'object' && item !== null) {
                    const itemObj = item as Record<string, string>
                    // Special handling for actors (video)
                    if (key === 'video' && nestedKey === 'actors') {
                      tags.push(m({ property: `${prefix}:actor`, content: itemObj.actor }))
                      if (itemObj.role) tags.push(m({ property: `${prefix}:actor:role`, content: itemObj.role }))
                    }
                  } else {
                    tags.push(m({ property: `${prefix}:${nestedKey}`, content: String(item) }))
                  }
                })
              } else {
                tags.push(m({ property: `${prefix}:${nestedKey}`, content: String(nestedVal) }))
              }
            })
        } else {
          // Standard OG property
          tags.push(m({ property: `og:${key}`, content: String(val) }))
        }
      })
  }

  // 3) Twitter Card tags
  if (config.twitter) {
    const tw = config.twitter as TwitterCard
      ; (Object.keys(tw) as (keyof TwitterCard)[]).forEach(key => {
        const val = tw[key]
        if (val) {
          if (key === 'imageAlt') {
            tags.push(m({ name: 'twitter:image:alt', content: String(val) }))
          } else {
            tags.push(m({ name: `twitter:${key}`, content: String(val) }))
          }
        }
      })
  }

  // 4) Extra meta tags
  config.extraMeta?.forEach(x => {
    if (x.name) {
      tags.push(m({ name: x.name, content: x.content }))
    } else if (x.property) {
      tags.push(m({ property: x.property, content: x.content }))
    }
  })

  // 5) Extra link tags
  config.extraLinks?.forEach(x => {
    const { rel, href, ...rest } = x
    tags.push(l(rel, href, rest))
  })

  // 6) Structured Data (JSON-LD)
  if (config.structuredData?.length) {
    config.structuredData.forEach(data => {
      // JSON.stringify handles escaping for JSON context
      tags.push(
        `<script type="application/ld+json">${JSON.stringify(data)}</script>`
      )
    })
  }

  // Join with newlines for readability in injected HTML
  return tags.join('\n')
}
