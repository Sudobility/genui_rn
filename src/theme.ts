import type { ViewStyle } from 'react-native';
import type {
  FontWeight,
  IRenderableLabelModifier,
  IRenderableViewModifier,
  ThemeColor,
} from './types';

// ---------------------------------------------------------------------------
// ThemeColor -> className maps
//
// Semantic intents map to @sudobility/design semantic tokens (bg-background,
// text-foreground, text-muted-foreground, bg-card, border-border, bg-primary,
// text-primary-foreground, text-destructive, text-success, text-warning, ...),
// which are theme-aware and flip light/dark at runtime via the consuming app's
// NativeWind setup.
//
// The `SYSTEM_*` / `WHITE` / `BLACK` / named-gray entries are a deliberate
// EXCEPTION: they mirror UIKit's `UIColor.systemX` named colors chosen directly
// by a generative payload (this is a generative-UI renderer). They are
// decorative identity data — a category/brand-style palette — with no
// semantic-token equivalent (the design system has no teal/indigo/mint/pink/...
// token). Collapsing them onto intent tokens would destroy the explicit color
// the payload asked for, so they stay as fixed palette classes by design.
// ---------------------------------------------------------------------------

const textColorMap: Record<string, string> = {
  // Semantic intents -> design tokens
  LABEL: 'text-foreground',
  LABEL_SECONDARY: 'text-muted-foreground',
  LABEL_TERTIARY: 'text-muted-foreground',
  LABEL_QUATERNARY: 'text-muted-foreground',
  LINK: 'text-primary',
  TABLE_CELL_BLUE_TEXT: 'text-primary',
  ACTION_TEXT: 'text-primary-foreground',
  ACTION_TEXT_SECONDARY: 'text-secondary-foreground',
  ACTION_TEXT_DESTRUCTIVE: 'text-destructive-foreground',
  NAVITEM_TEXT: 'text-muted-foreground',
  NAVITEM_TEXT_SELECTED: 'text-primary',
  SUCCESS: 'text-success',
  WARNING: 'text-warning',
  WARNING_SECONDARY: 'text-warning',
  ERROR: 'text-destructive',
  SELECTED: 'text-primary',
  DISABLED: 'text-muted-foreground',
  TEXT_PLACEHOLDER: 'text-muted-foreground',
  // Named system/generative palette (decorative identity — see header note)
  SYSTEM_BLUE: 'text-blue-500',
  SYSTEM_BROWN: 'text-amber-700',
  SYSTEM_CYAN: 'text-cyan-500',
  SYSTEM_GRAY: 'text-gray-500',
  SYSTEM_GRAY2: 'text-gray-400',
  SYSTEM_GRAY3: 'text-slate-400',
  SYSTEM_GRAY4: 'text-slate-300',
  SYSTEM_GRAY5: 'text-slate-200',
  SYSTEM_GRAY6: 'text-slate-100',
  SYSTEM_GREEN: 'text-green-500',
  SYSTEM_INDIGO: 'text-indigo-500',
  SYSTEM_LIME: 'text-lime-500',
  SYSTEM_MINT: 'text-emerald-400',
  SYSTEM_ORANGE: 'text-orange-500',
  SYSTEM_PINK: 'text-pink-500',
  SYSTEM_PURPLE: 'text-purple-500',
  SYSTEM_RED: 'text-red-500',
  SYSTEM_TEAL: 'text-teal-500',
  SYSTEM_YELLOW: 'text-yellow-500',
  WHITE: 'text-white',
  BLACK: 'text-black',
  LIGHT_GRAY: 'text-slate-300',
  DARK_GRAY: 'text-slate-700',
};

const backgroundColorMap: Record<string, string> = {
  // Semantic intents -> design tokens
  CLEAR: 'bg-transparent',
  BACKGROUND: 'bg-background',
  BACKGROUND_SECONDARY: 'bg-muted',
  BACKGROUND_TERTIARY: 'bg-muted',
  BACKGROUND_QUATERNARY: 'bg-muted',
  BACKGROUND_GROUPED: 'bg-muted',
  BACKGROUND_GROUPED_SECONDARY: 'bg-muted',
  BACKGROUND_GROUPED_TERTIARY: 'bg-muted',
  TABLE_BACKGROUND: 'bg-card',
  ACTION_BACKGROUND: 'bg-primary',
  ACTION_BACKGROUND_SECONDARY: 'bg-secondary',
  ACTION_BACKGROUND_DESTRUCTIVE: 'bg-destructive',
  NAV_BACKGROUND: 'bg-background',
  NAVITEM_BACKGROUND: 'bg-muted',
  NAVITEM_BACKGROUND_SELECTED: 'bg-accent',
  FILL: 'bg-muted',
  FILL_SECONDARY: 'bg-muted',
  FILL_TERTIARY: 'bg-muted',
  FILL_QUANTERNARY: 'bg-muted',
  SELECTED: 'bg-accent',
  SUCCESS: 'bg-success/10',
  WARNING: 'bg-warning/10',
  WARNING_SECONDARY: 'bg-warning/20',
  ERROR: 'bg-destructive/10',
  DISABLED: 'bg-muted',
  // Named system/generative palette (decorative identity — see header note)
  SYSTEM_BLUE: 'bg-blue-500',
  SYSTEM_BROWN: 'bg-amber-700',
  SYSTEM_CYAN: 'bg-cyan-500',
  SYSTEM_GRAY: 'bg-gray-500',
  SYSTEM_GRAY2: 'bg-gray-400',
  SYSTEM_GRAY3: 'bg-slate-400',
  SYSTEM_GRAY4: 'bg-slate-300',
  SYSTEM_GRAY5: 'bg-slate-200',
  SYSTEM_GRAY6: 'bg-slate-100',
  SYSTEM_GREEN: 'bg-green-500',
  SYSTEM_INDIGO: 'bg-indigo-500',
  SYSTEM_LIME: 'bg-lime-500',
  SYSTEM_MINT: 'bg-emerald-400',
  SYSTEM_ORANGE: 'bg-orange-500',
  SYSTEM_PINK: 'bg-pink-500',
  SYSTEM_PURPLE: 'bg-purple-500',
  SYSTEM_RED: 'bg-red-500',
  SYSTEM_TEAL: 'bg-teal-500',
  SYSTEM_YELLOW: 'bg-yellow-500',
  WHITE: 'bg-white',
  BLACK: 'bg-black',
  LIGHT_GRAY: 'bg-slate-200',
  DARK_GRAY: 'bg-slate-700',
};

const borderColorMap: Record<string, string> = {
  // Semantic intents -> design tokens
  SEPARATOR: 'border-border',
  SEPARATOR_OPAQUE: 'border-border',
  ACTION_BORDER: 'border-primary',
  ACTION_BORDER_SECONDARY: 'border-border',
  ACTION_BORDER_DESTRUCTIVE: 'border-destructive',
  SELECTED: 'border-primary',
  SUCCESS: 'border-success',
  WARNING: 'border-warning',
  WARNING_SECONDARY: 'border-warning',
  ERROR: 'border-destructive',
  DISABLED: 'border-border',
  LABEL_SECONDARY: 'border-border',
  // Named system/generative palette (decorative identity — see header note)
  SYSTEM_BLUE: 'border-blue-500',
  SYSTEM_BROWN: 'border-amber-700',
  SYSTEM_CYAN: 'border-cyan-500',
  SYSTEM_GRAY: 'border-gray-500',
  SYSTEM_GRAY2: 'border-gray-400',
  SYSTEM_GRAY3: 'border-slate-400',
  SYSTEM_GRAY4: 'border-slate-300',
  SYSTEM_GRAY5: 'border-slate-200',
  SYSTEM_GRAY6: 'border-slate-100',
  SYSTEM_GREEN: 'border-green-500',
  SYSTEM_INDIGO: 'border-indigo-500',
  SYSTEM_LIME: 'border-lime-500',
  SYSTEM_MINT: 'border-emerald-400',
  SYSTEM_ORANGE: 'border-orange-500',
  SYSTEM_PINK: 'border-pink-500',
  SYSTEM_PURPLE: 'border-purple-500',
  SYSTEM_RED: 'border-red-500',
  SYSTEM_TEAL: 'border-teal-500',
  SYSTEM_YELLOW: 'border-yellow-500',
  LIGHT_GRAY: 'border-slate-200',
  DARK_GRAY: 'border-slate-700',
};

const fontWeightMap: Record<FontWeight, string> = {
  TITLE: 'font-semibold',
  SUBTITLE: 'font-medium',
  BODY: 'font-normal',
  VALUE: 'font-medium',
  FOOTNOTE: 'font-normal uppercase tracking-wide text-xs',
};

export const resolveTextClasses = (
  modifier?: IRenderableLabelModifier | null
): string => {
  if (!modifier) {
    return '';
  }

  const classes = [];

  if (modifier.color) {
    classes.push(textColorMap[modifier.color] ?? '');
  }

  if (modifier.fontWeight) {
    classes.push(fontWeightMap[modifier.fontWeight] ?? '');
  }

  return classes.filter(Boolean).join(' ');
};

export const resolveViewModifierClasses = (
  modifier?: IRenderableViewModifier | null
): string => {
  if (!modifier) {
    return '';
  }

  const classes = [];

  if (modifier.bgColor) {
    classes.push(backgroundColorMap[modifier.bgColor] ?? '');
  }

  if (modifier.borderColor) {
    classes.push('border', borderColorMap[modifier.borderColor] ?? '');
  }

  return classes.filter(Boolean).join(' ');
};

export const resolveDimensionStyle = (
  modifier?: IRenderableViewModifier | null
): ViewStyle | undefined => {
  if (!modifier) {
    return undefined;
  }

  return {
    width: modifier.width ?? undefined,
    height: modifier.height ?? undefined,
    gap: modifier.spacing ?? undefined,
  };
};

export const isThemeColor = (value?: string | null): value is ThemeColor =>
  typeof value === 'string' && value.length > 0;
