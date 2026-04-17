import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { SeoProvider } from '../src/SeoProvider'
import { SeoTags } from '../src/SeoTags'

function getMetaByName(name: string): HTMLMetaElement | null {
  return document.head.querySelector(`meta[name="${name}"]`)
}

function getMetaByProperty(property: string): HTMLMetaElement | null {
  return document.head.querySelector(`meta[property="${property}"]`)
}

function resetHead(): void {
  document.title = ''

  document.head
    .querySelectorAll(
      'meta[name="description"],meta[name="robots"],meta[property^="og:"],meta[name^="twitter:"],meta[data-metafy],link[rel="canonical"],script[type="application/ld+json"]'
    )
    .forEach(el => el.remove())
}

describe('SeoTags', () => {
  beforeEach(() => {
    resetHead()
  })

  afterEach(() => {
    cleanup()
    resetHead()
  })

  it('applies and updates core tags', () => {
    const { rerender } = render(
      <SeoTags
        title="Home"
        description="Home description"
        canonical="https://example.com/home"
        twitter={{ card: 'summary' }}
      />
    )

    expect(document.title).toBe('Home')
    expect(getMetaByName('description')?.getAttribute('content')).toBe('Home description')
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://example.com/home')
    expect(getMetaByName('twitter:card')?.getAttribute('content')).toBe('summary')

    rerender(
      <SeoTags
        title="About"
        description="About description"
        canonical="https://example.com/about"
        twitter={{ card: 'summary_large_image' }}
      />
    )

    expect(document.title).toBe('About')
    expect(getMetaByName('description')?.getAttribute('content')).toBe('About description')
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://example.com/about')
    expect(getMetaByName('twitter:card')?.getAttribute('content')).toBe('summary_large_image')
  })

  it('supports multiple og:image values without removing non-managed tags', () => {
    const foreignOgImage = document.createElement('meta')
    foreignOgImage.setAttribute('property', 'og:image')
    foreignOgImage.setAttribute('content', 'https://foreign.example/og.jpg')
    document.head.appendChild(foreignOgImage)

    const { rerender } = render(
      <SeoTags
        openGraph={{
          title: 'First title',
          images: [
            { url: 'https://example.com/one.jpg', alt: 'One' },
            { url: 'https://example.com/two.jpg', alt: 'Two' }
          ]
        }}
      />
    )

    expect(document.head.querySelectorAll('meta[property="og:image"]').length).toBe(3)

    rerender(
      <SeoTags
        openGraph={{
          title: 'Second title',
          images: [{ url: 'https://example.com/three.jpg', alt: 'Three' }]
        }}
      />
    )

    const ogImages = Array.from(document.head.querySelectorAll('meta[property="og:image"]')).map(el =>
      el.getAttribute('content')
    )

    expect(ogImages).toContain('https://foreign.example/og.jpg')
    expect(ogImages).toContain('https://example.com/three.jpg')
    expect(ogImages).not.toContain('https://example.com/one.jpg')
    expect(ogImages).not.toContain('https://example.com/two.jpg')
    expect(document.head.querySelectorAll('meta[property="og:image"]').length).toBe(2)
    expect(getMetaByProperty('og:title')?.getAttribute('content')).toBe('Second title')
  })

  it('cleans up tags on unmount', () => {
    const { unmount } = render(
      <SeoProvider defaults={{ titleTemplate: '%s | Site' }}>
        <SeoTags
          title="Pricing"
          description="Pricing page"
          extraMeta={[{ name: 'custom-meta', content: '123' }]}
          structuredData={[{ '@type': 'Thing', name: 'Sample' }]}
        />
      </SeoProvider>
    )

    expect(getMetaByName('description')?.getAttribute('content')).toBe('Pricing page')
    expect(getMetaByName('custom-meta')?.getAttribute('content')).toBe('123')
    expect(document.head.querySelector('script[type="application/ld+json"]')).toBeTruthy()

    unmount()

    expect(getMetaByName('description')).toBeNull()
    expect(getMetaByName('custom-meta')).toBeNull()
    expect(document.head.querySelector('script[type="application/ld+json"]')).toBeNull()
  })
})
