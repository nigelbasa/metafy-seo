/**
 * Helper to upsert a DOM element in <head>.
 * 
 * @param head - The document.head element.
 * @param added - Array to track elements created by this component (for cleanup).
 * @param tag - Tag name ('meta' or 'link').
 * @param uniqueKey - The attribute name used to identify the tag (e.g. 'name', 'property', 'rel').
 * @param uniqueValue - The value for that attribute (e.g. 'description', 'og:title').
 * @param attrs - Full map of attributes to set on the element.
 */
export function upsertTag(
  head: HTMLElement,
  added: HTMLElement[],
  tag: 'meta' | 'link',
  uniqueKey: string,
  uniqueValue: string,
  attrs: Record<string, string>
): HTMLElement {
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