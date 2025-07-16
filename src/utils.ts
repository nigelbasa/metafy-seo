export function upsertTag(
  head: HTMLElement,
  added: HTMLElement[],
  tag: 'meta' | 'link',
  attrs: Record<string, string>,
  contentAttr: 'content' | 'href' = 'content'
): HTMLElement {
  // build a selector like: meta[name="foo"][content="bar"]
  const selector =
    tag +
    Object.entries(attrs)
      .map(([key, val]) => `[${key}="${val}"]`)
      .join('')

  let el = head.querySelector<HTMLElement>(selector)

  if (!el) {
    el = document.createElement(tag)
    // set all attributes
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v)
    }
    head.appendChild(el)
    added.push(el)
  } else if (attrs[contentAttr]) {
    // update content or href
    el.setAttribute(contentAttr, attrs[contentAttr])
  }

  return el
}