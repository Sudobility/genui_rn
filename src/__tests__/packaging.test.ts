import { readFileSync } from 'fs';
import { resolve } from 'path';

// NativeWind compiles `className` only in JSX the consuming app's Babel sees.
// A build loaded from `dist` calls `react/jsx-runtime` directly, so the app
// must be handed the source — and Metro reads `exports` before the top-level
// `react-native` field, so the condition has to be in both places.
describe('package.json', () => {
  const pkg = JSON.parse(
    readFileSync(resolve(__dirname, '../../package.json'), 'utf8')
  ) as {
    'react-native'?: string;
    exports: Record<string, Record<string, string> | string>;
    files: string[];
  };

  it('points React Native at the source, top level and in exports', () => {
    expect(pkg['react-native']).toBe('src/index.ts');

    const root = pkg.exports['.'] as Record<string, string>;
    expect(root['react-native']).toBe('./src/index.ts');

    // Conditions are matched in order: `react-native` must come before the
    // ones that lead to `dist`.
    const conditions = Object.keys(root);
    const at = (name: string) => conditions.indexOf(name);
    expect(at('react-native')).toBeGreaterThan(-1);
    for (const later of ['import', 'require', 'default']) {
      if (at(later) !== -1) {
        expect(at('react-native')).toBeLessThan(at(later));
      }
    }
  });

  it('publishes the source', () => {
    expect(pkg.files).toContain('src');
  });
});
