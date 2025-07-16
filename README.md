# metafy

> Lightweight React SEO toolkit: inject `<meta>`/`<link>`/`<title>` tags client-side, or generate SSR strings

metafy makes managing SEO metadata in React effortless. Whether you need to update `<head>` on user navigation or emit static `<title>` and `<meta>` tags at build time, metafy’s two-pronged API has you covered:

- **Declarative client-side updates** via `<SeoTags>`  
- **Server-side/SSG output** via `generateSeoMarkup`

Out of the box you get:  

- Zero runtime dependencies, fully typed in TypeScript  
- Built-in presets for site defaults, blog posts, and product pages  
- Open Graph & Twitter Card support  
- Automatic cleanup of injected tags on unmount  

metafy works with Vite, Create React App, Next.js, Express—any React environment. Focus on your content; let metafy handle the SEO plumbing.  

[![npm version](https://img.shields.io/npm/v/metafy.svg)](https://www.npmjs.com/package/metafy)  
[![Downloads](https://img.shields.io/npm/dm/metafy.svg)](https://npmjs.com/package/metafy)  
[![License: ISC](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

---

## 🚀 Installation

```bash
npm install metafy
# or
yarn add metafy
```

--- 

## 🔧 Quick Start (Vite + React)

### Manual `<SeoTags>` Usage

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { SeoTags } from 'metafy'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <>
    <SeoTags
      title="Hello Vite"
      description="Manually injecting SEO tags with metafy"
      canonical="/"
      openGraph={{
        url:         '/',
        title:       'Hello Vite OG',
        description: 'Open Graph description here',
        images:      [{ url: 'https://example.com/og.png', alt: 'Cover' }],
      }}
      twitter={{
        card:        'summary_large_image',
        site:        '@yourhandle',
        title:       'Hello Vite Twitter',
        description: 'Twitter card description',
        image:       'https://example.com/twitter.png'
      }}
      extraMeta={[
        { name: 'author', content: 'Nigel' },
        { property: 'article:tag', content: 'metafy' }
      ]}
      extraLinks={[
        { rel: 'stylesheet', href: '/seo-overrides.css' }
      ]}
    />
    <App />
  </>
)
```

Run the dev server and “View Source” to see your tags:

```bash
npm run dev
# or
yarn dev
```

---

### Using Built-in Presets

Instead of crafting each field manually, import a preset:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { SeoTags, blogPostPreset } from 'metafy'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <>
    <SeoTags
      {...blogPostPreset({
        title:         'Hello Vite',
        description:   'Using metafy with Vite + React',
        slug:          '/posts/hello-vite',
        author:        'Nigel',
        datePublished: '2025-07-16',
        images:        ['https://example.com/cover.png'],
        siteName:      'My Blog'
      })}
    />
    <App />
  </>
)
```


---

## 💻 SSR Example (Next.js)

Use `generateSeoMarkup()` to build head tags server-side:

```tsx
// pages/[slug].tsx
import Head from 'next/head'
import type { GetStaticProps } from 'next'
import { generateSeoMarkup, blogPostPreset } from 'metafy'

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await fetchPost(params!.slug as string)
  const seo  = generateSeoMarkup(
    blogPostPreset({
      title:         post.title,
      description:   post.excerpt,
      slug:          `/posts/${post.slug}`,
      author:        post.author,
      datePublished: post.publishedAt,
      images:        post.images,
      siteName:      'My Blog'
    })
  )
  return { props: { post, seo } }
}

export default function PostPage({ post, seo }: any) {
  return (
    <>
      <Head>
        {/* dangerouslySetInnerHTML for SSR head tags */}
        <div dangerouslySetInnerHTML={{ __html: seo }} />
      </Head>
      <article>
        <h1>{post.title}</h1>
        <div>{post.content}</div>
      </article>
    </>
  )
}
```

---

## 🌐 Plain Express SSR

```js
// server.js
import express from 'express'
import fs from 'fs'
import path from 'path'
import { generateSeoMarkup, defaultPreset } from 'metafy'

const app = express()
const template = fs.readFileSync(
  path.resolve(__dirname, 'dist/index.html'),
  'utf-8'
)

app.get('*', (req, res) => {
  const seo  = generateSeoMarkup(defaultPreset)
  const html = template.replace(
    '<head>',
    `<head>\n${seo}`
  )
  res.send(html)
})

app.listen(3000, () => {
  console.log('Server on http://localhost:3000')
})
```
---

## 📚 API Reference

### `<SeoTags {...config} />`

A React component that upserts `<title>`, `<meta>`, and `<link>` tags into `<head>` on mount and removes them on unmount.

| Prop           | Type               | Description                                  |
| -------------- | ------------------ | -------------------------------------------- |
| `title`        | `string`           | Page title                                   |
| `description`  | `string`           | Meta description                             |
| `canonical`    | `string`           | Canonical URL (rel="canonical")              |
| `keywords`     | `string[]`         | Comma-separated keywords                     |
| `robots`       | `string`           | e.g. "index,follow" or "noindex,nofollow"    |
| `viewport`     | `string`           | e.g. "width=device-width, initial-scale=1"   |
| `themeColor`   | `string`           | e.g. "#ffffff"                               |
| `author`       | `string`           | Page author                                  |
| `publisher`    | `string`           | Page publisher                               |
| `rating`       | `string`           | e.g. "5/5"                                   |
| `revisitAfter` | `string`           | e.g. "7 days"                                |
| `language`     | `string`           | e.g. "en-US"                                 |
| `openGraph`    | `OpenGraphConfig`  | OG tags: `url`, `title`, `description`, etc. |
| `twitter`      | `TwitterConfig`    | Twitter card tags                            |
| `extraMeta`    | `MetaEntry[]`      | Additional `<meta>` entries                  |
| `extraLinks`   | `LinkEntry[]`      | Additional `<link>` entries                  |

---

### `generateSeoMarkup(config: SeoConfig): string`

Generates a string of `<title>`, `<meta>`, and `<link>` tags from your config. Ideal for SSR or static-site injection.

```js
import { generateSeoMarkup, defaultPreset } from 'metafy'
const headHTML = generateSeoMarkup(defaultPreset)
```

---

### Built-in Presets

- **`defaultPreset: SeoConfig`**  
  Basic site-wide defaults: `title`, `description`, `robots`.

- **`blogPostPreset(opts: BlogPostOptions): SeoConfig`**  

  ```ts
  interface BlogPostOptions {
    title:         string
    description:   string
    slug:          string
    author:        string
    datePublished: string
    images?:       string[]
    siteName?:     string
  }
  ```

- **`productPreset(opts: ProductOptions): SeoConfig`**  

  ```ts
  interface ProductOptions {
    name:         string
    description:  string
    url:          string
    images?:      string[]
    price:        string
    currency:     string
    availability: 'InStock' | 'OutOfStock' | 'PreOrder'
  }
  ```

---

## 🛠️ Scripts

```jsonc
{
  "scripts": {
    "clean":   "rimraf dist",
    "build":   "npm run clean && rollup -c",
    "prepare": "npm run build"
  }
}
```

- `clean` uses [rimraf](https://npmjs.com/package/rimraf) for cross-platform directory removal  
- `prepare` runs on `npm publish` or when installing from Git

---

## 🤔 FAQ

**Q: Why only one `.d.ts`?**  
A: TypeScript reads from the `"types"` field; runtime picks CJS/ESM via `"main"`/`"module"`.

**Q: Do I need to build on install?**  
A: No—npm consumes your prebuilt `dist/` files. `prepare` only runs for Git installs or before publishing.

**Q: Can I update SEO tags dynamically at runtime?**  
A: Yes, simply render `<SeoTags>` conditionally or update its props. The component’s effect watches `JSON.stringify(config)`, so prop changes will update head tags. For best performance, memoize your config object.

**Q: How do I prevent duplicate tags when using SSR and client-side injection?**  
A: In your SSR pipeline, inject tags via `generateSeoMarkup()`. On the client, either skip `<SeoTags>` for those pages or mount it with the identical config so it replaces rather than duplicates tags.

**Q: Will `<SeoTags>` remove tags it didn’t add?**  
A: No. It only cleans up tags it inserted (tracked internally). If you need broader cleanup, write a custom effect or rely entirely on SSR.

**Q: How can I include JSON-LD structured data?**  
A: Use `extraMeta` to add a script tag:  
```tsx
<SeoTags
  extraMeta={[{
    name: 'application/ld+json',
    content: JSON.stringify(myJsonLdObject)
  }]}
/>
```

**Q: Is there any performance overhead?**  
A: The effect runs after mount and on config changes. Unless you remount constantly with very large configs, the impact is negligible. Memoizing your config can help.

**Q: Can I write unit tests for SEO tags?**  
A: Absolutely. In a JSDOM environment (e.g. React Testing Library), render your component and assert on `document.head.querySelector('meta[name="description"]')`, etc.

**Q: What if I render multiple `<SeoTags>`?**  
A: You can, but the last one wins on overlapping tags. It’s recommended to consolidate into a single `<SeoTags>` per page.

**Q: Can I use `generateSeoMarkup()` in Deno or edge runtimes?**  
A: Yes. It’s pure JavaScript/TypeScript with no Node-only APIs, so you can generate head strings anywhere.

**Q: How do I handle environment-specific tags (dev vs prod)?**  
A: Conditionally set fields in your config based on `process.env.NODE_ENV`, or wrap `<SeoTags>` in a component that reads your environment and toggles values accordingly.

---

## 🤝 Contributing

1. Fork & clone  the repo
2. `npm install && npm run build`  
3. Create a branch, commit your changes  
4. Open a pull request

---

## 📜 License

ISC © [Nigel Basarokwe]



