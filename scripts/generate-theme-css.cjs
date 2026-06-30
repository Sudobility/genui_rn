// Generates global.css for NativeWind from the active design-system theme.
//
// Emits the Tailwind directives plus a `:root` light fallback of the theme's CSS
// variables. The `.dark` block is intentionally dropped — on native it does
// nothing (NativeWind/react-native-css-interop does not switch CSS-variable
// blocks); runtime light/dark switching is the consuming app's job via a
// `vars()` provider. See mail_box_components_rn/docs/nativewind.md §2.4 / §2.10.
const fs = require('fs');
const path = require('path');
const { generateThemeCSS } = require('@sudobility/design');
const { defaultTheme } = require('@sudobility/design/themes');

const activeTheme = defaultTheme; // ← switch design style here (keep in sync with tailwind.config.js)

const full = generateThemeCSS(activeTheme);
const darkIdx = full.indexOf('.dark');
const lightRoot =
  (darkIdx >= 0 ? full.slice(0, darkIdx).trimEnd() : full.trimEnd()) + '\n';

const css = `@tailwind base;
@tailwind components;
@tailwind utilities;

${lightRoot}`;

fs.writeFileSync(path.join(__dirname, '..', 'global.css'), css);
console.log('Generated global.css from theme:', activeTheme.name);
