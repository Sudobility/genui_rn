import {
  resolveDimensionStyle,
  resolveTextClasses,
  resolveViewModifierClasses,
} from '../theme';
import { FontWeight, ThemeColor } from '../types';

// The class a payload token resolves to must be the one the web
// `@sudobility/genui` `theme.ts` resolves it to.
describe('theme', () => {
  it('maps background tokens as the web does', () => {
    const bg = (bgColor: ThemeColor) => resolveViewModifierClasses({ bgColor });

    expect(bg(ThemeColor.BACKGROUND)).toBe('bg-background');
    expect(bg(ThemeColor.BACKGROUND_SECONDARY)).toBe('bg-muted');
    expect(bg(ThemeColor.NAV_BACKGROUND)).toBe('bg-card');
    expect(bg(ThemeColor.ACTION_BACKGROUND)).toBe('bg-primary');
    expect(bg(ThemeColor.SUCCESS)).toBe('bg-success/10');
    expect(bg(ThemeColor.SYSTEM_BLUE)).toBe('bg-blue-500');
    // No background class for a token that names none.
    expect(bg(ThemeColor.LABEL)).toBe('');
    expect(resolveViewModifierClasses(null)).toBe('');
  });

  it('maps label color and weight tokens as the web does', () => {
    expect(
      resolveTextClasses({
        color: ThemeColor.LABEL_SECONDARY,
        fontWeight: FontWeight.TITLE,
      })
    ).toBe('text-muted-foreground font-semibold');
    expect(resolveTextClasses({ color: ThemeColor.ERROR })).toBe(
      'text-destructive'
    );
    expect(resolveTextClasses({ fontWeight: FontWeight.FOOTNOTE })).toBe(
      'font-normal uppercase tracking-wide text-xs'
    );
    expect(resolveTextClasses(undefined)).toBe('');
  });

  it('turns width, height and spacing into a style', () => {
    expect(
      resolveDimensionStyle({ width: 10, height: 20, spacing: 4 })
    ).toEqual({ width: 10, height: 20, gap: 4 });
    expect(resolveDimensionStyle(null)).toBeUndefined();
  });
});
