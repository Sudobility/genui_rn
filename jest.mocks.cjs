// Jest mocks — run before modules are loaded (setupFiles).
//
// The three native views the renderer draws have no implementation in Jest's
// React Native environment. Each is replaced by a plain host view that keeps
// its props, so a test can read what was passed and fire the callbacks.

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MapView = ({ children, ...props }) =>
    React.createElement(View, { testID: 'map-view', ...props }, children);
  const Marker = props =>
    React.createElement(View, { testID: 'map-marker', ...props });
  return { __esModule: true, default: MapView, Marker };
});

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    WebView: props => React.createElement(View, { testID: 'web-view', ...props }),
  };
});

jest.mock('@react-native-community/slider', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: props => React.createElement(View, { testID: 'slider', ...props }),
  };
});
