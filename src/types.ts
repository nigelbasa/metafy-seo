export interface StructuredData {
  /** Any valid JSON-LD schema object */
  [key: string]: any
}

export interface SeoProviderDefaults extends Partial<SeoConfig> {}

/** Context shape */
export interface SeoContextValue {
  defaults?: SeoProviderDefaults
  mergeConfig: (config: SeoConfig) => SeoConfig
}

export interface OpenGraphImage {
  url: string
  alt?: string
  width?: number
  height?: number
  type?: string
}

export interface OpenGraphArticle {
  publishedTime?: string
  modifiedTime?: string
  expirationTime?: string
  authors?: string[]
  section?: string
  tags?: string[]
}

export interface OpenGraphBook {
  authors?: string[]
  isbn?: string
  releaseDate?: string
  tags?: string[]
}

export interface OpenGraphProfile {
  firstName?: string
  lastName?: string
  username?: string
  gender?: 'male' | 'female'
}

export interface OpenGraphVideo {
  actors?: Array<{ actor: string; role?: string }>
  directors?: string[]
  writers?: string[]
  duration?: number
  releaseDate?: string
  tags?: string[]
  series?: string
}

export interface OpenGraph {
  title?: string
  description?: string
  url?: string
  /**
   * The type of your object, e.g., "video.movie".
   * Depending on the type, other properties may also be required.
   * Common types: 'website' | 'article' | 'book' | 'profile' | 'video.movie' | 'video.episode' | 'video.other'
   */
  type?: string
  siteName?: string
  images?: OpenGraphImage[]
  locale?: string
  /** Open Graph Article Object */
  article?: OpenGraphArticle
  /** Open Graph Book Object */
  book?: OpenGraphBook
  /** Open Graph Profile Object */
  profile?: OpenGraphProfile
  /** Open Graph Video Object */
  video?: OpenGraphVideo
}

export interface TwitterCard {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player'
  site?: string
  creator?: string
  title?: string
  description?: string
  image?: string
  imageAlt?: string // Add image alt for Twitter card
}

export interface IconsConfig {
  /** Default favicon (rel="icon") */
  icon?: string
  /** Apple touch icon (rel="apple-touch-icon") */
  apple?: string
  /** Safari pinned tab (rel="mask-icon") */
  mask?: { url: string; color?: string }
  /** Manifest file (rel="manifest") */
  manifest?: string
}

export interface SiteVerification {
  google?: string
  bing?: string
  yandex?: string
  pinterest?: string
}

export interface FacebookConfig {
  appId?: string
}

export interface SeoConfig {
  /**
   * Page title.
   * If `titleTemplate` is set in defaults, this title replaces '%s'.
   */
  title?: string
  /**
   * Template for the title (e.g., "%s | MyBrand").
   * The '%s' placeholder will be replaced by the `title` prop.
   */
  titleTemplate?: string

  description?: string
  canonical?: string
  /**
   * Generates a robots meta tag. If `noindex` or `nofollow` are set, this will be overridden.
   * e.g. "index,follow" or "noindex,nofollow".
   */
  robots?: string
  /** Shortcut for `robots: 'noindex'`. Overrides `robots` if both are set. */
  noindex?: boolean
  /** Shortcut for `robots: 'nofollow'`. Overrides `robots` if both are set. */
  nofollow?: boolean
  viewport?: string
  themeColor?: string
  author?: string
  publisher?: string
  language?: string

  openGraph?: OpenGraph
  twitter?: TwitterCard

  /**
   * Map of language codes to URLs for hreflang tags.
   * e.g. { 'en-US': '/en', 'fr-FR': '/fr' }
   */
  languageAlternates?: Record<string, string>

  /** Shortcut for common icon links */
  icons?: IconsConfig

  /** Site verification meta tags (e.g., for Google Search Console) */
  siteVerification?: SiteVerification

  /** Facebook-specific configurations */
  facebook?: FacebookConfig

  extraMeta?: Array<{ name?: string; property?: string; content: string }>
  extraLinks?: Array<{ rel: string; href: string; [key: string]: string }>
  structuredData?: StructuredData[]
}
