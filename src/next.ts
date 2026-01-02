/**
 * Next.js specific utilities for metafy-seo
 * 
 * These helpers generate metadata objects compatible with:
 * - Next.js 14+ App Router `export const metadata`
 * - Next.js `generateMetadata()` function
 * 
 * @example
 * ```tsx
 * // app/page.tsx
 * import { generateNextMetadata, blogPostPreset } from 'metafy-seo/next'
 * 
 * export const metadata = generateNextMetadata(blogPostPreset({
 *   title: 'My Blog Post',
 *   description: 'A great article',
 *   slug: '/blog/my-post',
 *   author: 'Nigel',
 *   datePublished: '2025-01-01'
 * }))
 * ```
 */

import type { SeoConfig, OpenGraph } from './types'

/**
 * Next.js Metadata type (subset of what Next.js accepts)
 * Full type available from 'next' package
 */
export interface NextMetadata {
    title?: string | { default: string; template?: string }
    description?: string
    robots?: string | { index?: boolean; follow?: boolean }
    viewport?: string | { width?: string; initialScale?: number }
    themeColor?: string
    authors?: Array<{ name: string; url?: string }>
    publisher?: string
    alternates?: {
        canonical?: string
        languages?: Record<string, string>
    }
    openGraph?: {
        type?: string
        siteName?: string
        title?: string
        description?: string
        url?: string
        images?: Array<{
            url: string
            alt?: string
            width?: number
            height?: number
        }>
        locale?: string
        article?: {
            publishedTime?: string
            modifiedTime?: string
            authors?: string[]
            section?: string
            tags?: string[]
        }
    }
    twitter?: {
        card?: 'summary' | 'summary_large_image' | 'app' | 'player'
        site?: string
        creator?: string
        title?: string
        description?: string
        images?: string | string[]
    }
    icons?: {
        icon?: string | string[]
        apple?: string | string[]
        shortcut?: string
    }
    verification?: {
        google?: string
        yandex?: string
        other?: Record<string, string>
    }
    other?: Record<string, string>
}

/**
 * Convert a metafy-seo SeoConfig to Next.js Metadata format.
 * 
 * @param config - The SEO configuration object
 * @returns A Next.js compatible Metadata object
 * 
 * @example
 * ```tsx
 * // app/page.tsx
 * import { generateNextMetadata } from 'metafy-seo'
 * 
 * export const metadata = generateNextMetadata({
 *   title: 'My Page',
 *   description: 'Page description',
 *   canonical: '/my-page'
 * })
 * ```
 */
export function generateNextMetadata(config: SeoConfig): NextMetadata {
    const metadata: NextMetadata = {}

    // Title with template support
    if (config.title) {
        if (config.titleTemplate) {
            metadata.title = {
                default: config.title,
                template: config.titleTemplate
            }
        } else {
            metadata.title = config.title
        }
    }

    if (config.description) {
        metadata.description = config.description
    }

    // Robots
    if (config.noindex || config.nofollow) {
        metadata.robots = {
            index: !config.noindex,
            follow: !config.nofollow
        }
    } else if (config.robots) {
        metadata.robots = config.robots
    }

    if (config.viewport) {
        metadata.viewport = config.viewport
    }

    if (config.themeColor) {
        metadata.themeColor = config.themeColor
    }

    if (config.author) {
        metadata.authors = [{ name: config.author }]
    }

    if (config.publisher) {
        metadata.publisher = config.publisher
    }

    // Alternates
    if (config.canonical || config.languageAlternates) {
        metadata.alternates = {}
        if (config.canonical) {
            metadata.alternates.canonical = config.canonical
        }
        if (config.languageAlternates) {
            metadata.alternates.languages = config.languageAlternates
        }
    }

    // Open Graph
    if (config.openGraph) {
        const og = config.openGraph as OpenGraph
        metadata.openGraph = {}

        if (og.type) metadata.openGraph.type = og.type
        if (og.siteName) metadata.openGraph.siteName = og.siteName
        if (og.title) metadata.openGraph.title = og.title
        if (og.description) metadata.openGraph.description = og.description
        if (og.url) metadata.openGraph.url = og.url
        if (og.locale) metadata.openGraph.locale = og.locale

        if (og.images?.length) {
            metadata.openGraph.images = og.images.map(img => ({
                url: img.url,
                alt: img.alt,
                width: img.width,
                height: img.height
            }))
        }

        if (og.article) {
            metadata.openGraph.article = {
                publishedTime: og.article.publishedTime,
                modifiedTime: og.article.modifiedTime,
                authors: og.article.authors,
                section: og.article.section,
                tags: og.article.tags
            }
        }
    }

    // Twitter
    if (config.twitter) {
        metadata.twitter = {}
        if (config.twitter.card) metadata.twitter.card = config.twitter.card
        if (config.twitter.site) metadata.twitter.site = config.twitter.site
        if (config.twitter.creator) metadata.twitter.creator = config.twitter.creator
        if (config.twitter.title) metadata.twitter.title = config.twitter.title
        if (config.twitter.description) metadata.twitter.description = config.twitter.description
        if (config.twitter.image) metadata.twitter.images = [config.twitter.image]
    }

    // Icons
    if (config.icons) {
        metadata.icons = {}
        if (config.icons.icon) metadata.icons.icon = config.icons.icon
        if (config.icons.apple) metadata.icons.apple = config.icons.apple
    }

    // Site verification
    if (config.siteVerification) {
        metadata.verification = {}
        if (config.siteVerification.google) {
            metadata.verification.google = config.siteVerification.google
        }
        if (config.siteVerification.yandex) {
            metadata.verification.yandex = config.siteVerification.yandex
        }
        // Bing and Pinterest go in 'other'
        if (config.siteVerification.bing || config.siteVerification.pinterest) {
            metadata.verification.other = {}
            if (config.siteVerification.bing) {
                metadata.verification.other['msvalidate.01'] = config.siteVerification.bing
            }
            if (config.siteVerification.pinterest) {
                metadata.verification.other['p:domain_verify'] = config.siteVerification.pinterest
            }
        }
    }

    // Facebook App ID goes in 'other'
    if (config.facebook?.appId) {
        metadata.other = metadata.other || {}
        metadata.other['fb:app_id'] = config.facebook.appId
    }

    return metadata
}

/**
 * Type-safe helper for creating Next.js metadata with autocomplete.
 * Simply re-exports generateNextMetadata for semantic clarity.
 */
export const createMetadata = generateNextMetadata
