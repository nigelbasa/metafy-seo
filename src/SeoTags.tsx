import React, { useEffect } from 'react'
import { SeoConfig, OpenGraph, TwitterCard } from './types'
import { upsertTag } from './utils'


/**
 * React component that injects SEO tags into the document <head>.
 *
 * It handles:
 * - title, meta[name*], link[rel=canonical]
 * - Open Graph and Twitter Card tags
 * - custom extraMeta and extraLinks entries
 *
 * @remarks
 * Uses a cleanup effect to remove tags when this component unmounts.
 *
 * @example
 * <SeoTags
 *   title="My Page"
 *   description="Page description"
 *   canonical="/my-page"
 *   openGraph={{ url: '/my-page', title: 'My Page' }}
 *   twitter={{ card: 'summary', site: '@mysite' }}
 * />
 *
 * @param config - SEO configuration object (see SeoConfig).
 * @returns `null` (manipulates <head> as side effect).
 */
export const SeoTags: React.FC<SeoConfig> = config => {
  useEffect(() => {
    const head = document.head
    // Track newly appended elements so we can clean up on unmount
    const added: HTMLElement[] = []

    /**
     * Helper to upsert a <meta> tag.
     * @param attrs - key/value map of attributes for the <meta>.
     */
    const addMeta = (attrs: Record<string, string>) =>
      upsertTag(head, added, 'meta', attrs)


    /**
     * Helper to upsert a <link> tag.
     * @param attrs - key/value map (must include href).
     */
    const addLink = (attrs: Record<string, string>) =>
      upsertTag(head, added, 'link', attrs, 'href')

    // 1) Title tag
    // Try to find existing <head><title>; otherwise create one
    let titleEl = document.querySelector<HTMLTitleElement>('head > title')
    if (!titleEl && config.title) {
      titleEl = document.createElement('title')
      head.appendChild(titleEl)
      added.push(titleEl)
    }
    // Update title text if provided
    if (titleEl && config.title) {
      titleEl.textContent = config.title
    }

    // 2) Core meta & link
    // Insert standard SEO tags if those config fields exist
    config.description && addMeta({ name: 'description', content: config.description })
    config.keywords    && addMeta({ name: 'keywords', content: config.keywords.join(',') })
    config.robots      && addMeta({ name: 'robots', content: config.robots })
    config.viewport    && addMeta({ name: 'viewport', content: config.viewport })
    config.themeColor  && addMeta({ name: 'theme-color', content: config.themeColor })
    config.canonical   && addLink({ rel: 'canonical', href: config.canonical })
    config.author      && addMeta({ name: 'author', content: config.author })
    config.publisher   && addMeta({ name: 'publisher', content: config.publisher })
    config.rating      && addMeta({ name: 'rating', content: config.rating })
    config.revisitAfter&& addMeta({ name: 'revisit-after', content: config.revisitAfter })
    config.language    && addMeta({ name: 'language', content: config.language })

    // 3) OpenGraph (typed via keyof)
    if (config.openGraph) {
      // Cast to our OpenGraph interface to preserve keyof type safety
      const og = config.openGraph as OpenGraph
      ;(Object.keys(og) as (keyof OpenGraph)[]).forEach(key => {
        const val = og[key]
        if (!val) return

        if (key === 'images' && Array.isArray(val)) {
          // Handle array of images specially
          val.forEach(img => {
            addMeta({ property: 'og:image', content: img.url })
            img.alt && addMeta({ property: 'og:image:alt', content: img.alt })
          })
        } else {
          // Standard OG properties (og:title, og:url, etc.)
          addMeta({ property: `og:${key}`, content: String(val) })
        }
      })
    }

    // 4) Twitter (typed via keyof)
    if (config.twitter) {
      const tw = config.twitter as TwitterCard
      ;(Object.keys(tw) as (keyof TwitterCard)[]).forEach(key => {
        const val = tw[key]
        if (val) addMeta({ name: `twitter:${key}`, content: String(val) })
      })
    }

    // 5) Extras
    // Allow arbitrary <meta> and <link> entries from extraMeta/extraLinks
    config.extraMeta?.forEach(addMeta)
    config.extraLinks?.forEach(addLink)

    // Cleanup: remove tags we added on unmount
    return () => {
      added.forEach(el => head.contains(el) && head.removeChild(el))
    }
  }, [
    // JSON.stringify to trigger effect on deep config changes,
    // but note: large config objects may cause extra renders.
    JSON.stringify(config) 
  ])

  // No JSX rendered; this component exists for side-effects only
  return null
}

