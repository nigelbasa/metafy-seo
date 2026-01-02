// Main exports
export { SeoTags } from './SeoTags'
export { generateSeoMarkup } from './generateSeoMarkup'
export { SeoProvider, useSeo } from './SeoProvider'

// Types
export * from './types'

// Utilities
export { isServer, isClient, escapeHtml, deepMerge } from './utils'

// Presets
export {
  defaultPreset,
  blogPostPreset,
  productPreset,
  pagePreset,
  socialPreset,
  type BlogPostOptions,
  type ProductOptions,
  type PageOptions,
  type SocialOptions
} from './presets'

// Next.js specific exports
export {
  generateNextMetadata,
  createMetadata,
  type NextMetadata
} from './next'
