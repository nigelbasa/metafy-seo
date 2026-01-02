# Development Guide

## Project Structure

```
metafy-seo/
├── src/
│   ├── index.ts          # Main exports
│   ├── SeoTags.tsx       # Client-side component
│   ├── SeoProvider.tsx   # Context provider
│   ├── generateSeoMarkup.ts  # SSR markup generator
│   ├── next.ts           # Next.js specific utilities
│   ├── presets.ts        # Ready-to-use configurations
│   ├── types.ts          # TypeScript definitions
│   └── utils.ts          # Helper utilities
├── dist/
│   ├── esm/              # ES Modules build
│   └── cjs/              # CommonJS build
├── rollup.config.js      # Build configuration
└── tsconfig.json         # TypeScript configuration
```

## Building

```bash
npm run build
```

This cleans the `dist/` folder and runs Rollup to generate both ESM and CJS bundles.

## Key Design Decisions

### SSR Safety
- All DOM operations check `typeof window !== 'undefined'`
- `isServer` and `isClient` utilities exported for consumers

### XSS Protection  
- All content passed to `generateSeoMarkup()` is HTML escaped
- Uses `escapeHtml()` utility for `&`, `<`, `>`, `"`, `'`

### Deep Merging
- `SeoProvider` uses deep merge for nested objects (openGraph, twitter)
- Prevents losing nested properties when overriding

### Next.js Support
- `generateNextMetadata()` converts our config to Next.js format
- Keeps our API consistent while supporting native Next.js features

## Adding a New Preset

1. Define interface in `presets.ts`:
```ts
export interface MyPresetOptions {
  title: string
  // ...
}
```

2. Create preset function:
```ts
export function myPreset(opts: MyPresetOptions): SeoConfig {
  return {
    title: opts.title,
    // ...
  }
}
```

3. Export from `index.ts`

## Testing Locally

Link the package for local testing:

```bash
npm link
cd ../your-project
npm link metafy-seo
```

## Publishing

Semantic Release handles versioning based on commit messages:

- `fix:` → Patch release (1.0.x)
- `feat:` → Minor release (1.x.0)
- `BREAKING CHANGE:` → Major release (x.0.0)

Manual publish:
```bash
npm publish
```

## Commit Format

Use [Conventional Commits](https://www.conventionalcommits.org):

```
feat: add socialPreset for social media optimization
fix: escape HTML entities in meta content
docs: update README examples
chore: update dependencies
```
