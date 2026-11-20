# CLAUDE.md

## What this is

`@sudobility/genui_rn` — a React Native **library** (not an app) that renders
`IRenderable` tree payloads (server-driven / generative UI) to native views.
Single public export: `<GenUI renderable onAction className googleMapsApiKey />`.
Consumed by bare RN apps via GitHub Packages. **No Expo.**

**It is the native mirror of the web `@sudobility/genui`** (sibling checkout
`../genui`): same public surface, same dispatch table, same parts in the same
order, same wording, same `onAction` contract. See "Mirror of the web renderer".

## Stack

- Bare React Native (peer `>=0.72`, dev against 0.83.10), React 18/19.
- TypeScript 6, ESLint 10, Prettier 3.
- Build: **Vite** library mode + `tsc` for types. Not Metro, not Expo.
- Styling: NativeWind 4 + Tailwind 3 classNames over `@sudobility/design` tokens.
- Package manager: **bun** (`bun@1.3.10`). Use `bun`, not npm/yarn.

## Commands (verified from package.json)

- Build: `bun run build` (`tsc && vite build && node scripts/fix-esm-imports.mjs`)
- Watch: `bun run dev`
- Types: `bun run type-check`
- Lint: `bun run lint` (max-warnings 0 — must be clean)
- Format: `bun run format` / `bun run format:check`
- Tests: `bun run test:unit` — jest (`jest.config.cjs`, RN preset, RNTL), 35
  tests in `src/__tests__/`: `gen-ui.test.tsx` (the web suite case for case,
  plus the mirrored behaviour beyond it), `theme.test.ts`, `packaging.test.ts`.
  The real `@sudobility/components-rn` is loaded; only `react-native-maps`,
  `react-native-webview` and the slider are stand-ins (`jest.mocks.cjs`).
  `babel.config.cjs` exists for Jest only — the build does not read it.
- Theme CSS: `bun run generate:theme`

## Install gotcha (GitHub Packages)

`.npmrc` sets `@sudobility:registry=https://npm.pkg.github.com` but holds **no auth**.
Installing `@sudobility/*` requires a GitHub token with `read:packages` in your
`~/.npmrc` (CI uses `GH_PACKAGES_READ_TOKEN`). Without it, `bun install` fails to
resolve the scoped deps.

## Architecture

- `src/index.ts` — public exports: `GenUI` + types/enums re-exported from
  `@sudobility/genui_types` (schema is owned there, not here).
- `src/gen-ui.tsx` — a bare `w-full` `Box` around `RenderNode` (no padding,
  background or rounding of its own — the host decides the surface).
- `src/render-node.tsx` — the renderer (~1150 lines). `RenderNode` reads
  `viewOf(renderable)` then branches on `view.layout` (string) to per-layout
  render functions; unmatched layouts fall back to a basic card. Interaction
  flows out via the `onAction` callback. This is where almost all logic lives.
- `src/utils.ts` — `labelText`, `imageSrc`, `viewOf`, layout predicates, keyboard types.
- `src/theme.ts` — maps payload `ThemeColor`/`FontWeight` → Tailwind classes +
  inline dimension styles.
- `scripts/fix-esm-imports.mjs` / `generate-theme-css.cjs` — build/theme helpers.

## Mirror of the web renderer

When `../genui/src/render-node.tsx` (or `theme.ts`) changes, port the change
here. What must stay identical:

- **Dispatch order and layout sets** (`CollectionLayouts`, `ActionLayouts`,
  `LineLayouts`, the `if` chain in `RenderNode`), and the fallback: unknown
  layout → `renderBasicCard`; no view → `null`.
- **`onAction`**: actions report `destination.value` (else `valueText`); inputs,
  toggles, sliders and selects report their initial value **on mount**, then on
  every change; a select reports the option's **label**, not its value; `link`
  opens its URL and reports nothing.
- **Structure**: no card chrome anywhere (no border / padding / background unless
  the payload's modifier asks); `paragraph`, `footer` and `line_*` render their
  children; `list*` rows form one rounded block with square buttons
  (`InListContext` stands in for the web's `[&_button]:rounded-none`); `grid*` is
  one column, two from `md`, in 4:3 cells; misplaced `renderable.children` are
  adopted into the view.
- **Wording**: `'Enter text'`, `'Enter value'`, `'Select an option'`,
  `'No locations to display.'`, `'Embedded content'`.

Native stand-ins that are *not* divergences: `FlatList` carousel for Swiper,
`react-native-maps` for Google Maps JS (so `googleMapsApiKey` is accepted and
unused, and there is no "API key not provided" state), `WebView` for `<iframe>`,
`Linking.openURL` for `<a target=_blank>`, components-rn `DateInput` for
`<input type=date>`, a fixed 200pt fallback height for images (a remote image
has no intrinsic size here).

Differences still open — undecided, so left as they were; do not "fix" one
without a decision:

- `modifier.borderColor` draws a border here (`borderColorMap` in `theme.ts`);
  the web dropped border handling in 0.1.29 and ignores the field.
- A `map` with a single location opens zoomed in on it here; the web opens at
  zoom 5 (it only fits bounds for two or more).
- `stacked_horizontal` / `spaced_horizontal` are a plain row here; the web row
  scrolls sideways (`overflow-x-auto`) and shrinks its children to fit.
- `line_toggle` passes the payload value as a constant `checked` on both sides,
  so the switch reports changes but never stays flipped unless the host
  re-renders with a new payload. Shared with the web, not a divergence.
- `ThemeColor.TABLE_BACKGROUND` (value `'BACKGROUND_TABLE'`) matches no entry of
  `backgroundColorMap`, which is keyed `TABLE_BACKGROUND`. Shared with the web.

## Conventions & gotchas

- **`className` only on `@sudobility/components-rn` components, never on a core
  React Native one** (`View`, `Image`, `Text`, `Pressable`, …). NativeWind
  compiles `className` in JSX that the consuming app's Babel transforms; a core
  component reached through a precompiled build silently drops it. Containers
  are `Box`, text is `Text`; core components take `style`.
- **Packaging**: `package.json` has `"react-native": "src/index.ts"` at top level
  **and** a `"react-native": "./src/index.ts"` condition in `exports["."]`,
  placed before `import`/`require` (Metro reads `exports` first, in order);
  `src` is published. `packaging.test.ts` guards this. A consuming app must list
  this package in its Tailwind `content`
  (`./node_modules/@sudobility/genui_rn/src/**/*.{ts,tsx}`) or the classes named
  here (`bg-blue-500`, `aspect-[4/3]`, `md:w-[48%]`, …) are never generated.

- **Build externals**: Vite externalizes react, react-native, all `@sudobility/*`,
  nativewind, clsx, react-native-webview, react-native-maps, slider — never bundle
  them.
- `fix-esm-imports.mjs` is mandatory post-build: `tsc` (bundler resolution) emits
  extensionless relative imports that Node ESM rejects; the script adds `.js`.
- `theme.ts` keeps a `SYSTEM_*`/named-color palette mapped to fixed Tailwind
  colors **by design** (generative payload picks explicit decorative colors with no
  semantic-token equivalent). Don't collapse these onto intent tokens.
- `global.css` is **generated by `generate:theme` and gitignored** — never hand-edit
  or commit it. `.dark` block is dropped on purpose; dark mode is the consuming
  app's job (`vars()` provider).
- Adding a new layout = add a `view.layout` branch in `render-node.tsx` (and a
  layout set if it's a collection/action/line/input family); schema enums live in
  `@sudobility/genui_types`.

## Release

CI (`.github/workflows/ci-cd.yml` → `johnqh/workflows/unified-cicd.yml`) publishes to
GitHub Packages on push to `main`/`develop`. Release by bumping `version` in
`package.json`. License: BUSL-1.1.
