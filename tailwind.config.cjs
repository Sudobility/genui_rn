// NativeWind / Tailwind config for @sudobility/genui_rn.
//
// This library emits semantic design-system classes (bg-primary,
// text-foreground, border-border, ...). createTailwindPreset() maps those tokens
// to hsl(var(--…)) (the CSS-variable form that supports light/dark). The preset's
// calc()-based radii don't evaluate on native, so concrete px are computed from
// the active theme's radius. Consuming apps may scan this package's src in their
// own tailwind content; this config lets the library be generated/verified
// standalone. See mail_box_components_rn/docs/nativewind.md §2.5.
const { createTailwindPreset } = require('@sudobility/design');
const { defaultTheme } = require('@sudobility/design/themes');

const radiusPx = parseFloat(defaultTheme.light.radius) * 16; // "0.5rem" -> 8

module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@sudobility/components-rn/{src,dist}/**/*.{js,jsx,ts,tsx}',
    './node_modules/@sudobility/design/dist/**/*.{js,jsx}',
  ],
  presets: [require('nativewind/preset'), createTailwindPreset()],
  theme: {
    extend: {
      // Override calc()-based radii with concrete px (NativeWind can't eval calc).
      borderRadius: {
        sm: `${Math.max(radiusPx - 4, 0)}px`,
        md: `${Math.max(radiusPx - 2, 0)}px`,
        lg: `${radiusPx}px`,
        xl: `${radiusPx + 4}px`,
      },
    },
  },
  plugins: [],
};
