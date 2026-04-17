# metafy-seo

> Lightweight SEO toolkit for client-rendered React SPAs (Vite, CRA, and similar)

[![npm version](https://img.shields.io/npm/v/metafy-seo.svg)](https://www.npmjs.com/package/metafy-seo)
[![npm downloads](https://img.shields.io/npm/dt/metafy-seo.svg)](https://www.npmjs.com/package/metafy-seo)
[![License: ISC](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

## Scope

metafy-seo is intentionally **SPA-only**.

- Supported: React SPAs such as Vite, CRA, Preact/React compatibility layers, and similar client-rendered setups.
- Not supported: Next.js metadata API, server-side rendering, or server-generated head markup flows.

## Features

- Client-side `<head>` management for title/meta/link/script tags
- Open Graph and Twitter card support
- JSON-LD structured data support
- TypeScript-first API
- Ready-to-use presets for common page types
- Zero runtime dependencies beyond React

## Installation

```bash
npm install metafy-seo
```

## Quick Start

```tsx
import { SeoTags } from 'metafy-seo'

export default function App() {
  return (
    <>
      <SeoTags
        title="My Page"
        description="Page description"
        canonical="/my-page"
        openGraph={{
          url: 'https://example.com/my-page',
          title: 'My Page',
          images: [
            { url: 'https://example.com/og-1.jpg', alt: 'Cover' },
            { url: 'https://example.com/og-2.jpg', alt: 'Alternate cover' }
          ]
        }}
        twitter={{ card: 'summary_large_image' }}
      />
      <main>...</main>
    </>
  )
}
```

## Global Defaults

```tsx
import { SeoProvider, SeoTags } from 'metafy-seo'

function Root() {
  return (
    <SeoProvider
      defaults={{
        titleTemplate: '%s | My Site',
        twitter: { site: '@myhandle' }
      }}
    >
      <SeoTags title="About" />
    </SeoProvider>
  )
}
```

## Presets

| Preset | Use Case |
|--------|----------|
| `pagePreset()` | Generic pages |
| `blogPostPreset()` | Blog articles |
| `productPreset()` | E-commerce products (includes JSON-LD) |
| `socialPreset()` | Social media optimized |

## API Reference

### `<SeoTags {...config} />`

Client-side component that injects SEO tags into `<head>`.

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Page title |
| `description` | `string` | Meta description |
| `canonical` | `string` | Canonical URL |
| `noindex` | `boolean` | Prevent indexing |
| `openGraph` | `object` | OG tags (title, description, images, etc.) |
| `twitter` | `object` | Twitter card (card, site, image, etc.) |
| `icons` | `object` | Favicon, apple-touch-icon |
| `structuredData` | `object[]` | JSON-LD schema objects |

## Utilities

```ts
import { isClient, isServer, deepMerge } from 'metafy-seo'

if (isClient) {
  // Browser-only logic
}
```

## License

ISC (c) [Nigel E. Basarokwe](https://github.com/nigelbasa)
