export interface OpenGraphImage {
  url: string
  alt?: string
}

export interface OpenGraph {
  title?: string
  description?: string
  url?: string
  type?: string
  siteName?: string
  images?: OpenGraphImage[]
}

export interface TwitterCard {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player'
  site?: string
  creator?: string
  title?: string
  description?: string
  image?: string
}

export interface SeoConfig {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  robots?: string
  viewport?: string
  themeColor?: string
  author?: string
  publisher?: string
  rating?: string
  revisitAfter?: string
  language?: string

  openGraph?: OpenGraph
  twitter?: TwitterCard

  extraMeta?: Array<{ name?: string; property?: string; content: string }>
  extraLinks?: Array<{ rel: string; href: string }>
}
