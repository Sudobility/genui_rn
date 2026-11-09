# @sudobility/genui_rn

React Native renderer for **IRenderable** tree payloads — a server-driven / generative-UI
component. Given an `IRenderable` tree (the shared schema from `@sudobility/genui_types`),
`<GenUI>` renders it to native views, styled with NativeWind + the `@sudobility/design`
token system.

This is a **library**, not an app. It is published to GitHub Packages and consumed by
React Native apps. It targets **bare React Native** (RN >= 0.72; developed against 0.83) —
there is no Expo config here.

## Public API

```tsx
import { GenUI } from '@sudobility/genui_rn';
import type { IRenderable, GenUIActionHandler } from '@sudobility/genui_rn';

function Screen({ tree }: { tree: IRenderable }) {
  const onAction: GenUIActionHandler = action => {
    // handle taps, links, input changes, toggles, etc.
  };
  return <GenUI renderable={tree} onAction={onAction} className="..." />;
}
```

`GenUI` is the only runtime export. It wraps the recursive `RenderNode` dispatcher in a
styled `Box`. Props (`GenUIProps`): `renderable: IRenderable` (required),
`onAction?: GenUIActionHandler`, `className?: string`.

The package also re-exports the shared types and enums from `@sudobility/genui_types`
(`IRenderable*`, `GenUIActionHandler`, `IScreenSEO`, and the `FontWeight`, `ThemeColor`,
`ScreenLayout`, `ViewLayout` enums) so consumers import them from one place.

## Install

Scoped `@sudobility/*` packages live on **GitHub Packages**. The repo `.npmrc` points the
scope at `https://npm.pkg.github.com`; you must provide auth for that registry (a GitHub
token with `read:packages`) via your user `~/.npmrc` or the `GH_PACKAGES_READ_TOKEN`
environment the CI uses. Without it, install fails to resolve `@sudobility/*`.

```bash
bun install          # bun is the package manager (bun@1.3.10)
```

Peer dependencies the consuming app must provide: `react`, `react-native`,
`@sudobility/components-rn`, `@sudobility/design`, `@sudobility/genui_types`, `nativewind`,
`clsx`, `react-native-webview`, `react-native-maps`, `@react-native-community/slider`.
The consuming app is also responsible for the NativeWind/Tailwind setup and runtime
light/dark theming (see "Theming" below).

## Scripts

| Command | What it does |
| --- | --- |
| `bun run build` | `tsc` (emit types + JS to `dist/`) → `vite build` (ESM + CJS bundles) → `scripts/fix-esm-imports.mjs` (add explicit extensions to relative imports). |
| `bun run dev` | `vite build --watch`. |
| `bun run type-check` | `tsc --noEmit`. |
| `bun run lint` | ESLint over `src` (zero warnings allowed). |
| `bun run format` / `format:check` | Prettier write / check. |
| `bun run test:unit` | `jest --passWithNoTests` — **no test suite exists yet**; this passes vacuously. |
| `bun run generate:theme` | Regenerate `global.css` from the active design theme (see below). |

`prepublishOnly` runs `bun run build`; publishing is handled by CI.

## Build output

`dist/` contains `index.esm.js`, `index.cjs.js`, and `index.d.ts` (+ source/declaration
maps). Vite builds in library mode and externalizes `react`, `react-native`, all
`@sudobility/*` packages, `nativewind`, `clsx`, `react-native-webview`, `react-native-maps`,
and `@react-native-community/slider`, so they are never bundled. `package.json#react-native`
points to `src/index.ts`, so Metro-based consumers transpile the source directly.

`fix-esm-imports.mjs` is required because `tsc` runs under `moduleResolution: "bundler"` and
emits extensionless relative imports that Node's native ESM loader rejects; the script
rewrites them to explicit `./foo.js` / `./foo/index.js` paths.

## Theming

Styling uses NativeWind 4 classNames resolved against `@sudobility/design` semantic tokens
(`bg-background`, `text-foreground`, `text-primary`, `border-border`, …). `src/theme.ts` maps
the payload's `ThemeColor` / `FontWeight` values to Tailwind classes and resolves inline
dimension styles. A few native props that cannot take a className (Slider tint,
ActivityIndicator) derive a concrete `hsl(...)` color from the same tokens.

`generate:theme` emits `global.css` (Tailwind directives + a `:root` light fallback of the
theme CSS variables) for NativeWind. `global.css` is **generated and gitignored** — not
committed. The `.dark` block is intentionally dropped; runtime light/dark switching is the
consuming app's responsibility via a `vars()` provider.

## Source layout

```
src/
  index.ts        Public exports (GenUI + types/enums)
  gen-ui.tsx      <GenUI> — styled container around RenderNode
  render-node.tsx Recursive renderer; dispatches on view.layout to per-layout renderers
  types.ts        Re-exports @sudobility/genui_types + GenUIProps
  utils.ts        Helpers: labelText, imageSrc, viewOf, layout predicates, keyboard types
  theme.ts        ThemeColor/FontWeight → className maps + dimension style resolution
scripts/
  fix-esm-imports.mjs    Post-build: add explicit extensions to emitted relative imports
  generate-theme-css.cjs Generate global.css from the active design theme
```

### How rendering works

`RenderNode` reads `view = renderable.view` (or, for a screen destination, its `view`) and
branches on `view.layout`. The layout string selects a renderer: collections
(`list*`, `grid*`, `carousel`, `calendar`, `stacked*`, `tabs*`, `spaced*`, `header`), actions
(`action`, `fab*`, `link`, `nav_item`, `tile`, `chip`, …), line layouts (`line_title*`,
`line_image_title*`), inputs (`input_text`, `input_numeric`, `input_password`, `input_email`,
`input_phone`, `input_date`, `input_text_block`, `search`), plus `line_toggle`, `line_slider`,
`line_select`, `map`/`map_pin`, `web`, images, spacers, `waiting`, `paragraph`/`text_markup`,
`footer`, and `center*`. Anything unmatched falls back to a basic card. User interaction is
surfaced through the `onAction` callback.

## CI / publishing

`.github/workflows/ci-cd.yml` delegates to the `johnqh/workflows` reusable
`unified-cicd.yml` and publishes to **GitHub Packages** (`publish-target: github`) on pushes
to `main`/`develop`. Bump `version` in `package.json` to release.

## License

BUSL-1.1.
