# metafy-seo

> Lightweight, SSR-safe React SEO toolkit for managing meta tags, Open Graph, and Twitter Cards

[![npm version](https://img.shields.io/npm/v/metafy-seo.svg)](https://www.npmjs.com/package/metafy-seo)
[![License: ISC](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

## Features

- ✅ **SSR Safe** - Works with Next.js, Remix, and any SSR framework
- ✅ **Next.js App Router** - Native metadata API support
- ✅ **Zero Dependencies** - Only React as peer dependency
- ✅ **TypeScript** - Fully typed
- ✅ **XSS Protected** - Auto-escapes content
- ✅ **Presets** - Ready-to-use configs for blogs, products, social

## Installation

```bash
npm install metafy-seo
```

## Quick Start

### React / Vite / CRA

```tsx
import { SeoTags } from 'metafy-seo'

function App() {
  return (
    <>
      <SeoTags
        title="My Page"
        description="Page description"
        canonical="/my-page"
        openGraph={{ url: '/my-page', title: 'My Page' }}
        twitter={{ card: 'summary_large_image' }}
      />
      <main>...</main>
    </>
  )
}
```

### Next.js App Router (v14+)

```tsx
// app/page.tsx
import { generateNextMetadata, pagePreset } from 'metafy-seo'

export const metadata = generateNextMetadata(pagePreset({
  title: 'My Site',
  description: 'Welcome to my site',
  url: 'https://example.com',
  image: '/og-image.png'
}))

export default function Page() {
  return <main>...</main>
}
```

### SSR / Static Generation

```ts
import { generateSeoMarkup, blogPostPreset } from 'metafy-seo'

const headTags = generateSeoMarkup(blogPostPreset({
  title: 'My Blog Post',
  description: 'A great article',
  slug: '/blog/my-post',
  author: 'Nigel',
  datePublished: '2025-01-01'
}))
// Returns: <title>My Blog Post</title><meta name="description"...
```

## Presets

| Preset | Use Case |
|--------|----------|
| `pagePreset()` | Generic pages |
| `blogPostPreset()` | Blog articles |
| `productPreset()` | E-commerce products (includes JSON-LD) |
| `socialPreset()` | Social media optimized |

## Global Defaults

```tsx
import { SeoProvider, SeoTags } from 'metafy-seo'

function App() {
  return (
    <SeoProvider defaults={{ 
      titleTemplate: '%s | My Site',
      twitter: { site: '@myhandle' }
    }}>
      <SeoTags title="About" /> {/* → "About | My Site" */}
    </SeoProvider>
  )
}
```

## API Reference

### `<SeoTags {...config} />`

Client-side component that injects meta tags into `<head>`.

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

### `generateNextMetadata(config)`

Converts SeoConfig to Next.js Metadata format.

### `generateSeoMarkup(config)`

Returns HTML string for SSR injection.

## Utilities

```ts
import { isServer, isClient, escapeHtml } from 'metafy-seo'

if (isClient) {
  // Browser-only code
}
```

## License

ISC © [Nigel E. Basarokwe](https://github.com/nigelbasa)
