// src/presets.ts
import type { SeoConfig } from './types'

/**
 * Default SEO configuration applied site-wide.
 *
 * @remarks
 * This preset covers basic title, description, and robots tags.
 */
export const defaultPreset: SeoConfig = {
  title: 'My Site',
  description: 'Welcome to my awesome site',
  robots: 'index,follow'
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
  /** The author's name to display in metadata. */
  author: string
  /** ISO date string for when this post was published. */
  datePublished: string
  /** Optional ISO date string for when this post was last modified. */
  dateModified?: string
  /** Optional array of image URLs associated with this post. */
  images?: string[]
  /** Optional site name to use in Open Graph metadata. */
  siteName?: string
  /** Optional category/section of the article */
  section?: string
  /** Optional tags for the article */
  tags?: string[]
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
 * @param opts - Configuration values specific to the blog post.
 * @returns A `SeoConfig` ready for `<SeoTags>` or `generateSeoMarkup()`.
 */
export function blogPostPreset(opts: BlogPostOptions): SeoConfig {
  return {
    title: opts.title,
    description: opts.description,
    canonical: opts.slug,
    author: opts.author,
    openGraph: {
      type: 'article',
      title: opts.title,
      description: opts.description,
      url: opts.slug,
      siteName: opts.siteName,
      images: opts.images?.map(url => ({ url })),
      article: {
        publishedTime: opts.datePublished,
        modifiedTime: opts.dateModified,
        authors: opts.author ? [opts.author] : [],
        section: opts.section,
        tags: opts.tags
      }
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      image: opts.images?.[0] ?? ''
    }
  }
}

/**
 * Options for generating SEO metadata for a product page.
 */
export interface ProductOptions {
  /** The product's display name. */
  name: string
  /** A short, marketing-friendly description. */
  description: string
  /** The product's full URL or path, used as canonical link. */
  url: string
  /** Optional array of image URLs showcasing the product. */
  images?: string[]
  /** Price amount as a string (e.g. "19.99"). */
  price: string
  /** Currency code in ISO 4217 format (e.g. "USD"). */
  currency: string
  /** Stock status: InStock, OutOfStock, or PreOrder. */
  availability: 'InStock' | 'OutOfStock' | 'PreOrder'
  /** Optional brand name */
  brand?: string
  /** Optional product category */
  category?: string
}

/**
 * Generate a full `SeoConfig` tailored for a product page.
 *
 * @remarks
 * - Sets title, description, and canonical link.  
 * - Builds Open Graph metadata including images.  
 * - Appends product-specific meta tags for price, currency, and availability.
 * - Includes JSON-LD structured data for products.
 *
 * @param opts - Configuration values specific to the product.
 * @returns A `SeoConfig` ready for `<SeoTags>` or `generateSeoMarkup()`.
 */
export function productPreset(opts: ProductOptions): SeoConfig {
  return {
    title: opts.name,
    description: opts.description,
    canonical: opts.url,
    openGraph: {
      type: 'product',
      title: opts.name,
      description: opts.description,
      url: opts.url,
      images: opts.images?.map(url => ({ url }))
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.name,
      description: opts.description,
      image: opts.images?.[0] ?? ''
    },
    extraMeta: [
      { property: 'product:price:amount', content: opts.price },
      { property: 'product:price:currency', content: opts.currency },
      { property: 'product:availability', content: opts.availability }
    ],
    structuredData: [{
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: opts.name,
      description: opts.description,
      image: opts.images,
      brand: opts.brand ? { '@type': 'Brand', name: opts.brand } : undefined,
      category: opts.category,
      offers: {
        '@type': 'Offer',
        price: opts.price,
        priceCurrency: opts.currency,
        availability: `https://schema.org/${opts.availability}`
      }
    }]
  }
}

/**
 * Options for generating SEO metadata for a generic page.
 */
export interface PageOptions {
  /** The page title */
  title: string
  /** Meta description */
  description: string
  /** Canonical URL or path */
  url: string
  /** Optional OG image */
  image?: string
  /** Optional site name */
  siteName?: string
}

/**
 * Generate SEO config for a generic page.
 * 
 * @param opts - Page options
 * @returns A `SeoConfig` for the page
 */
export function pagePreset(opts: PageOptions): SeoConfig {
  return {
    title: opts.title,
    description: opts.description,
    canonical: opts.url,
    openGraph: {
      type: 'website',
      title: opts.title,
      description: opts.description,
      url: opts.url,
      siteName: opts.siteName,
      images: opts.image ? [{ url: opts.image }] : undefined
    },
    twitter: {
      card: opts.image ? 'summary_large_image' : 'summary',
      title: opts.title,
      description: opts.description,
      image: opts.image
    }
  }
}

/**
 * Options for social-media focused SEO.
 */
export interface SocialOptions {
  /** Page title for social shares */
  title: string
  /** Description for social cards */
  description: string
  /** Full URL of the page */
  url: string
  /** Main image for social sharing (required) */
  image: string
  /** Image alt text */
  imageAlt?: string
  /** Site name */
  siteName?: string
  /** Twitter @handle for the site */
  twitterSite?: string
  /** Twitter @handle for the content creator */
  twitterCreator?: string
}

/**
 * Generate SEO config optimized for social media sharing.
 * 
 * @param opts - Social media options
 * @returns A `SeoConfig` optimized for social shares
 */
export function socialPreset(opts: SocialOptions): SeoConfig {
  return {
    title: opts.title,
    description: opts.description,
    canonical: opts.url,
    openGraph: {
      type: 'website',
      title: opts.title,
      description: opts.description,
      url: opts.url,
      siteName: opts.siteName,
      images: [{
        url: opts.image,
        alt: opts.imageAlt,
        width: 1200,
        height: 630
      }]
    },
    twitter: {
      card: 'summary_large_image',
      site: opts.twitterSite,
      creator: opts.twitterCreator,
      title: opts.title,
      description: opts.description,
      image: opts.image,
      imageAlt: opts.imageAlt
    }
  }
}
