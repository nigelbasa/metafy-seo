import React, { useEffect, useRef } from 'react'
import { SeoConfig, OpenGraph, TwitterCard } from './types'
import { upsertTag, isServer } from './utils'
import { useSeo } from './SeoProvider'

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
 * Client-only behavior: tags are injected in the browser after mount.
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
export const SeoTags: React.FC<SeoConfig> = props => {
  const { mergeConfig } = useSeo()
  const config = mergeConfig(props)
  const prevConfigRef = useRef<string>('')

  useEffect(() => {
    // Runtime safety: skip when no browser globals are available.
    if (isServer) return

    const configString = JSON.stringify(config)

    // Skip if config hasn't changed
    if (configString === prevConfigRef.current) return
    prevConfigRef.current = configString

    const head = document.head
    // Track newly appended elements so we can clean up on unmount
    const added: HTMLElement[] = []

    /**
     * Helper to upsert a <meta> tag.
     * Identifies tag by `name` or `property`.
     */
    const addMeta = (uniqueKey: 'name' | 'property', uniqueValue: string, content: string) => {
      if (!content) return
      upsertTag(head, added, 'meta', uniqueKey, uniqueValue, {
        [uniqueKey]: uniqueValue,
        content
      })
    }

    /**
     * Helper to upsert a <link> tag.
     * Identifies tag by `rel`.
     */
    const addLink = (rel: string, href: string, extraAttrs: Record<string, string> = {}) => {
      if (!href) return
      upsertTag(head, added, 'link', 'rel', rel, {
        rel,
        href,
        ...extraAttrs
      })
    }

    /**
     * Helper for multi-value OG fields that require duplicate meta tags.
     * Tags are marked with data-metafy so only library-managed tags are replaced.
     */
    const addManagedPropertyMeta = (dataKey: string, property: string, content: string) => {
      if (!content) return
      const el = document.createElement('meta')
      el.setAttribute('property', property)
      el.setAttribute('content', content)
      el.setAttribute('data-metafy', dataKey)
      head.appendChild(el)
      added.push(el)
    }

    // 1) Title tag
    let titleEl = document.querySelector<HTMLTitleElement>('head > title')
    if (config.title) {
      const titleText = config.titleTemplate
        ? config.titleTemplate.replace('%s', config.title)
        : config.title

      if (!titleEl) {
        titleEl = document.createElement('title')
        head.appendChild(titleEl)
        added.push(titleEl)
      }
      titleEl.textContent = titleText
    }

    // 2) Core meta & link
    if (config.description) addMeta('name', 'description', config.description)

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
      addMeta('name', 'robots', robotsContent)
    }

    if (config.viewport) addMeta('name', 'viewport', config.viewport)
    if (config.themeColor) addMeta('name', 'theme-color', config.themeColor)
    if (config.author) addMeta('name', 'author', config.author)
    if (config.publisher) addMeta('name', 'publisher', config.publisher)
    if (config.language) addMeta('name', 'language', config.language)

    if (config.canonical) addLink('canonical', config.canonical)

    // Site Verification
    if (config.siteVerification) {
      if (config.siteVerification.google) addMeta('name', 'google-site-verification', config.siteVerification.google)
      if (config.siteVerification.bing) addMeta('name', 'msvalidate.01', config.siteVerification.bing)
      if (config.siteVerification.yandex) addMeta('name', 'yandex-verification', config.siteVerification.yandex)
      if (config.siteVerification.pinterest) addMeta('name', 'p:domain_verify', config.siteVerification.pinterest)
    }

    // Facebook App ID
    if (config.facebook?.appId) {
      addMeta('property', 'fb:app_id', config.facebook.appId)
    }

    // 3) Language Alternates (hreflang)
    if (config.languageAlternates) {
      Object.entries(config.languageAlternates).forEach(([lang, href]) => {
        upsertTag(head, added, 'link', 'hreflang', lang, {
          rel: 'alternate',
          hreflang: lang,
          href
        })
      })
    }

    // 4) Icons
    if (config.icons) {
      if (config.icons.icon) addLink('icon', config.icons.icon)
      if (config.icons.apple) addLink('apple-touch-icon', config.icons.apple)
      if (config.icons.manifest) addLink('manifest', config.icons.manifest)
      if (config.icons.mask) {
        addLink('mask-icon', config.icons.mask.url, {
          color: config.icons.mask.color || '#000000'
        })
      }
    }

    // 5) OpenGraph
    if (config.openGraph) {
      const og = config.openGraph as OpenGraph
        ; (Object.keys(og) as (keyof OpenGraph)[]).forEach(key => {
          const val = og[key]
          if (!val) return

          if (key === 'images' && Array.isArray(val)) {
            // Replace only tags managed by this library for OG images.
            head.querySelectorAll<HTMLMetaElement>('meta[data-metafy^="og-image-"]').forEach(el => {
              head.removeChild(el)
            })

            val.forEach((img, index) => {
              addManagedPropertyMeta(`og-image-${index}`, 'og:image', img.url)
              if (img.alt) addManagedPropertyMeta(`og-image-${index}-alt`, 'og:image:alt', img.alt)
              if (img.width) addManagedPropertyMeta(`og-image-${index}-width`, 'og:image:width', String(img.width))
              if (img.height) addManagedPropertyMeta(`og-image-${index}-height`, 'og:image:height', String(img.height))
              if (img.type) addManagedPropertyMeta(`og-image-${index}-type`, 'og:image:type', img.type)
            })
          } else if (typeof val === 'object') {
            // Handle nested OG objects (article, book, profile, video)
            const prefix = `og:${key}`
            const valObj = val as Record<string, unknown>
              ; (Object.keys(valObj)).forEach(nestedKey => {
                const nestedVal = valObj[nestedKey]
                if (!nestedVal) return

                if (Array.isArray(nestedVal)) {
                  const arrayTagPrefix = `og-array-${String(key)}-${nestedKey}`
                  head.querySelectorAll<HTMLMetaElement>(`meta[data-metafy^="${arrayTagPrefix}-"]`).forEach(el => {
                    head.removeChild(el)
                  })

                    ; (nestedVal as unknown[]).forEach((item: unknown, itemIndex: number) => {
                      if (typeof item === 'object' && item !== null) {
                        const itemObj = item as Record<string, string>
                        if (key === 'video' && nestedKey === 'actors') {
                          addManagedPropertyMeta(`${arrayTagPrefix}-${itemIndex}-actor`, `${prefix}:actor`, itemObj.actor)
                          if (itemObj.role) {
                            addManagedPropertyMeta(`${arrayTagPrefix}-${itemIndex}-role`, `${prefix}:actor:role`, itemObj.role)
                          }
                        }
                      } else {
                        addManagedPropertyMeta(
                          `${arrayTagPrefix}-${itemIndex}`,
                          `${prefix}:${nestedKey}`,
                          String(item)
                        )
                      }
                    })
                } else {
                  addMeta('property', `${prefix}:${nestedKey}`, String(nestedVal))
                }
              })
          } else {
            addMeta('property', `og:${key}`, String(val))
          }
        })
    }

    // 6) Twitter
    if (config.twitter) {
      const tw = config.twitter as TwitterCard
        ; (Object.keys(tw) as (keyof TwitterCard)[]).forEach(key => {
          const val = tw[key]
          if (val) {
            if (key === 'imageAlt') {
              addMeta('name', 'twitter:image:alt', String(val))
            } else {
              addMeta('name', `twitter:${key}`, String(val))
            }
          }
        })
    }

    // 7) Structured Data
    if (config.structuredData?.length) {
      // Clear existing structured data scripts
      head.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"][data-metafy^="structured-"]').forEach(el => {
        if (added.includes(el)) return
        head.removeChild(el)
      })
      config.structuredData.forEach((obj, i) => {
        const el = document.createElement('script')
        el.type = 'application/ld+json'
        el.setAttribute('data-metafy', `structured-${i}`)
        el.textContent = JSON.stringify(obj)
        head.appendChild(el)
        added.push(el)
      })
    }

    // 8) Extras
    head.querySelectorAll<HTMLMetaElement>('meta[data-metafy^="extra-meta"]').forEach(el => {
      if (added.includes(el)) return
      head.removeChild(el)
    })
    head.querySelectorAll<HTMLLinkElement>('link[data-metafy^="extra-link"]').forEach(el => {
      if (added.includes(el)) return
      head.removeChild(el)
    })

    config.extraMeta?.forEach((x, i) => {
      const el = document.createElement('meta')
      if (x.name) el.setAttribute('name', x.name)
      else if (x.property) el.setAttribute('property', x.property)
      el.setAttribute('content', x.content)
      el.setAttribute('data-metafy', `extra-meta-${i}`)
      head.appendChild(el)
      added.push(el)
    })

    config.extraLinks?.forEach((x, i) => {
      const el = document.createElement('link')
      Object.entries(x).forEach(([k, v]) => el.setAttribute(k, v))
      el.setAttribute('data-metafy', `extra-link-${i}`)
      head.appendChild(el)
      added.push(el)
    })

    // Cleanup
    return () => {
      added.forEach(el => head.contains(el) && head.removeChild(el))
    }
  }, [JSON.stringify(config)])

  return null
}

SeoTags.displayName = 'SeoTags'
