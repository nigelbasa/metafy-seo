import React, { useEffect } from 'react'
import { SeoConfig, OpenGraph, TwitterCard } from './types'
import { upsertTag } from './utils'

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
      
        useEffect(() => {
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
              // Hreflang links are unique by their 'hreflang' attribute + 'rel=alternate'
              // For simplicity/robustness with current upsertTag:
              // We can't easily unique-key them by just 'rel', so we'll treat them as "extra" for now
              // OR we just append them. Since they are specific keys, let's unique them by 'hreflang'.
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
            ;(Object.keys(og) as (keyof OpenGraph)[]).forEach(key => {
              const val = og[key]
              if (!val) return
      
              if (key === 'images' && Array.isArray(val)) {
                // Clear previous OG images before adding new ones
                head.querySelectorAll<HTMLMetaElement>('meta[property^="og:image"]').forEach(el => {
                  if (added.includes(el)) return // don't remove if this component added it previously
                  head.removeChild(el)
                })
                // Now add new ones
                val.forEach(img => {
                  addMeta('property', 'og:image', img.url)
                  if (img.alt) addMeta('property', 'og:image:alt', img.alt)
                  if (img.width) addMeta('property', 'og:image:width', String(img.width))
                  if (img.height) addMeta('property', 'og:image:height', String(img.height))
                  if (img.type) addMeta('property', 'og:image:type', img.type)
                })
              } else if (typeof val === 'object') {
                // Handle nested OG objects (article, book, profile, video)
                const prefix = `og:${key}` // e.g., og:article
                ;(Object.keys(val) as (keyof typeof val)[]).forEach(nestedKey => {
                  const nestedVal = val[nestedKey]
                  if (!nestedVal) return
      
                  if (Array.isArray(nestedVal)) {
                    // Clear previous nested array OG tags (e.g. og:article:author)
                    head.querySelectorAll<HTMLMetaElement>(`meta[property="${prefix}:${nestedKey}"]`).forEach(el => {
                      if (added.includes(el)) return
                      head.removeChild(el)
                    })
                    nestedVal.forEach(item => {
                      if (typeof item === 'object' && item !== null) {
                        // Special handling for actors (video) where item is { actor: string, role?: string }
                        if (key === 'video' && nestedKey === 'actors') {
                          addMeta('property', `${prefix}:actor`, item.actor)
                          if (item.role) addMeta('property', `${prefix}:actor:role`, item.role)
                        }
                      } else {
                        addMeta('property', `${prefix}:${nestedKey}`, String(item))
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
            ;(Object.keys(tw) as (keyof TwitterCard)[]).forEach(key => {
              const val = tw[key]
              if (val) {
                if (key === 'imageAlt') { // Handle imageAlt specifically as it maps to twitter:image:alt
                  addMeta('name', 'twitter:image:alt', String(val))
                } else {
                  addMeta('name', `twitter:${key}`, String(val))
                }
              }
            })
          }
      
          // 7) Structured Data
          if (config.structuredData?.length) {
            // Clear existing structured data scripts added by this component
            head.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"][data-metafy^="structured-"]').forEach(el => {
              if (added.includes(el)) return
              head.removeChild(el)
            })
            config.structuredData.forEach((obj, i) => {
              const el = document.createElement('script')
              el.type = 'application/ld+json'
              el.setAttribute('data-metafy', `structured-${i}`) // Add a data attribute to identify
              el.textContent = JSON.stringify(obj)
              head.appendChild(el)
              added.push(el)
            })
          }
      
          // 8) Extras (these are append only for now, as we can't reliably dedupe generic extraMeta/extraLinks)
          // Clear previous extraMeta/extraLinks added by this component with specific data-metafy attributes
          head.querySelectorAll<HTMLMetaElement>('meta[data-metafy="extra-meta"]').forEach(el => {
            if (added.includes(el)) return
            head.removeChild(el)
          })
          head.querySelectorAll<HTMLLinkElement>('link[data-metafy="extra-link"]').forEach(el => {
            if (added.includes(el)) return
            head.removeChild(el)
          })
      
          config.extraMeta?.forEach((x, i) => {
            const el = document.createElement('meta')
            if (x.name) el.setAttribute('name', x.name)
            else if (x.property) el.setAttribute('property', x.property)
            el.setAttribute('content', x.content)
            el.setAttribute('data-metafy', `extra-meta-${i}`) // Add a data attribute to identify
            head.appendChild(el)
            added.push(el)
          })
      
          config.extraLinks?.forEach((x, i) => {
            const el = document.createElement('link')
            Object.entries(x).forEach(([k, v]) => el.setAttribute(k, v))
            el.setAttribute('data-metafy', `extra-link-${i}`) // Add a data attribute to identify
            head.appendChild(el)
            added.push(el)
          })
      
          // Cleanup
          return () => {
            added.forEach(el => head.contains(el) && head.removeChild(el))
          }
        }, [JSON.stringify(config)]) // Trigger re-run on config change
      
        return null
      }
