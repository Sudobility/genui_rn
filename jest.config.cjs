/** @type {import('jest').Config} */
module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.mocks.cjs'],
  setupFilesAfterEnv: ['./jest.setup.cjs'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: [
    '<rootDir>/src/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: [
    // Bun may store deps in node_modules/.bun/<pkg>@<ver>/node_modules/<pkg>/,
    // so the usual pattern misses them. Every ESM/untranspiled dep the
    // library's own code or tests can reach must be named.
    'node_modules/(?!(\\.bun/[^/]+/node_modules/)?(react-native|react-native-[^/]+|@react-native|@react-native-community|@react-native-segmented-control|@react-navigation|nativewind|@testing-library|@sudobility)/)',
  ],
  moduleNameMapper: {
    // `@sudobility/genui_types` exports only an `import` condition, which
    // Jest's CommonJS resolver does not assert; point at the file directly.
    '^@sudobility/genui_types$':
      '<rootDir>/node_modules/@sudobility/genui_types/dist/index.js',
  },
};
