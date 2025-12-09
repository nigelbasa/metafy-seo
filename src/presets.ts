// src/presets.ts
import type { SeoConfig } from './types'

/**
 * Default SEO configuration applied site-wide.
 *
 * @remarks
 * This preset covers basic title, description, and robots tags.
 */
export const defaultPreset: SeoConfig = {
  title:       'My Site',
  description: 'Welcome to my awesome site',
  robots:      'index,follow'
}

/**
 * Options for generating SEO metadata for a blog post.
 */
export interface BlogPostOptions {
  /** The headline or title of the article. */
  title: string
  /** A brief summary or excerpt of the post. */
  description: string
  /** The canonical path or URL for the article (e.g. "/posts/hello-world"). */
  slug: string
  /** The author’s name to display in metadata. */
  author: string
  /** ISO date string for when this post was published. */
  datePublished: string
  /** Optional array of image URLs associated with this post. */
  images?: string[]
  /** Optional site name to use in Open Graph metadata. */
  siteName?: string
}

/**
 * Generate a full `SeoConfig` tailored for a blog post.
 *
 * @remarks
 * - Sets the `<title>` and meta description.  
 * - Adds `canonical` link to `slug`.  
 * - Builds Open Graph properties including images.  
 * - Configures Twitter Card for large image preview.  
 * - Appends `article:published_time` and `article:author` meta tags.
 *
 * @example
 * ```ts
 * import { blogPostPreset } from 'react-seo'
 *
 * const seo = blogPostPreset({
 *   title: 'Deep Dive into TSDoc',
 *   description: 'Learn how to document TypeScript libraries effectively.',
 *   slug: '/posts/tsdoc-guide',
 *   author: 'Jane Doe',
 *   datePublished: '2025-07-16',
 *   images: ['https://cdn.example.com/cover.png'],
 *   siteName: 'Example Blog'
 * })
 * ```
 *
 * @param opts - Configuration values specific to the blog post.
 * @returns A `SeoConfig` ready for `<SeoTags>` or `generateSeoMarkup()`.
 */
export function blogPostPreset(opts: BlogPostOptions): SeoConfig {
  return {
    title:       opts.title,
    description: opts.description,
    canonical:   opts.slug,
    openGraph: {
      type:        'article',
      title:       opts.title,
      description: opts.description,
      url:         opts.slug,
      siteName:    opts.siteName,
      images:      opts.images?.map(url => ({ url })),
      article:     {
        publishedTime: opts.datePublished,
        authors:       opts.author ? [opts.author] : []
      }
    },
    twitter: {
      card:        'summary_large_image',
      title:       opts.title,
      description: opts.description,
      image:       opts.images?.[0] ?? ''
    }
  }
}

/**
 * Options for generating SEO metadata for a product page.
 */
export interface ProductOptions {
  /** The product’s display name. */
  name: string
  /** A short, marketing-friendly description. */
  description: string
  /** The product’s full URL or path, used as canonical link. */
  url: string
  /** Optional array of image URLs showcasing the product. */
  images?: string[]
  /** Price amount as a string (e.g. "19.99"). */
  price: string
  /** Currency code in ISO 4217 format (e.g. "USD"). */
  currency: string
  /** Stock status: InStock, OutOfStock, or PreOrder. */
  availability: 'InStock' | 'OutOfStock' | 'PreOrder'
}

/**
 * Generate a full `SeoConfig` tailored for a product page.
 *
 * @remarks
 * - Sets title, description, and canonical link.  
 * - Builds Open Graph metadata including images.  
 * - Appends product-specific meta tags for price, currency, and availability.
 *
 * @example
 * ```ts
 * import { productPreset } from 'react-seo'
 *
 * const seo = productPreset({
 *   name: 'Wireless Headphones',
 *   description: 'Noise-cancelling over-ear headphones.',
 *   url: '/products/headphones',
 *   images: ['https://cdn.example.com/headphones.jpg'],
 *   price: '99.99',
 *   currency: 'USD',
 *   availability: 'InStock'
 * })
 * ```
 *
 * @param opts - Configuration values specific to the product.
 * @returns A `SeoConfig` ready for `<SeoTags>` or `generateSeoMarkup()`.
 */
export function productPreset(opts: ProductOptions): SeoConfig {
  return {
    title:       opts.name,
    description: opts.description,
    canonical:   opts.url,
    openGraph: {
      title:       opts.name,
      description: opts.description,
      url:         opts.url,
      images:      opts.images?.map(url => ({ url }))
    },
    extraMeta: [
      { property: 'product:price:amount',   content: opts.price },
      { property: 'product:price:currency', content: opts.currency },
      { property: 'product:availability',   content: opts.availability }
    ]
  }
}
