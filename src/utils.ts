/**
 * SSR and utility helpers for metafy-seo
 */

/** Check if code is running on server (no window/document) */
export const isServer = typeof window === 'undefined'

/** Check if code is running on client (has window/document) */
export const isClient = !isServer

/**
 * Escape HTML entities to prevent XSS attacks in meta tag content.
 * 
 * @param str - The string to escape
 * @returns Escaped string safe for HTML attributes
 */
export function escapeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Helper to upsert a DOM element in <head>.
 * 
 * @param head - The document.head element.
 * @param added - Array to track elements created by this component (for cleanup).
 * @param tag - Tag name ('meta' or 'link').
 * @param uniqueKey - The attribute name used to identify the tag (e.g. 'name', 'property', 'rel').
 * @param uniqueValue - The value for that attribute (e.g. 'description', 'og:title').
 * @param attrs - Full map of attributes to set on the element.
 * @returns The created/updated element, or null if running on server
 */
export function upsertTag(
  head: HTMLElement,
  added: HTMLElement[],
  tag: 'meta' | 'link',
  uniqueKey: string,
  uniqueValue: string,
  attrs: Record<string, string>
): HTMLElement | null {
  // SSR safety: return early if no document
  if (isServer) return null

  // Try to find an existing tag that matches the unique key/value
  // e.g. meta[name="description"]
  const selector = `${tag}[${uniqueKey}="${uniqueValue}"]`
  let el = head.querySelector<HTMLElement>(selector)

  if (!el) {
    // Create new
    el = document.createElement(tag)
    // Set identifying attribute first
    el.setAttribute(uniqueKey, uniqueValue)
    head.appendChild(el)
    added.push(el)
  }

  // Update/Set all other attributes
  // We do this even if it existed, to ensure it matches current config
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v)
  }

  return el
}

/**
 * Deep merge two objects, with source values taking precedence.
 * Useful for merging SEO configs.
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (
      sourceValue !== undefined &&
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      // Recursively merge objects
      result[key] = deepMerge(targetValue, sourceValue) as any
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as any
    }
  }

  return result
}