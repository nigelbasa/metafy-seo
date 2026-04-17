# Development Guide

## Project Structure

```
metafy-seo/
├── src/
│   ├── index.ts          # Main exports
│   ├── SeoTags.tsx       # Client-side component
│   ├── SeoProvider.tsx   # Context provider
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

### SPA-Only Runtime
- All DOM operations run on the client inside React effects
- `isServer` and `isClient` are exposed as runtime guards

### XSS Protection  
- Uses `escapeHtml()` utility for `&`, `<`, `>`, `"`, `'`

### Deep Merging
- `SeoProvider` uses deep merge for nested objects (openGraph, twitter)
- Prevents losing nested properties when overriding

### Scope
- Package targets client-rendered React SPAs only (Vite, CRA, similar)
- Next.js metadata helpers and server-rendered markup generation are intentionally out of scope

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
