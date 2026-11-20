// Re-export all shared types from genui_types
export {
  FontWeight,
  ThemeColor,
  ScreenLayout,
  ViewLayout,
} from '@sudobility/genui_types';
export type {
  GenUIActionHandler,
  IRenderable,
  IRenderableAction,
  IRenderableImage,
  IRenderableImageModifier,
  IRenderableLabel,
  IRenderableLabelModifier,
  IRenderableLocation,
  IRenderableScreen,
  IRenderableScreenModifier,
  IRenderableUrl,
  IRenderableView,
  IRenderableViewModifier,
  IScreenSEO,
} from '@sudobility/genui_types';

import type { GenUIActionHandler, IRenderable } from '@sudobility/genui_types';

export interface GenUIProps {
  renderable: IRenderable;
  onAction?: GenUIActionHandler;
  className?: string;
  /**
   * Accepted so a call site written for the web `@sudobility/genui` compiles
   * unchanged; **not used on native**. The web draws `map` / `map_pin` with
   * Google Maps JS and needs the key at runtime. Here they are drawn by
   * `react-native-maps`, which takes its key from the app's native
   * configuration (Android manifest / iOS `AppDelegate`), so the maps render
   * with or without this prop.
   */
  googleMapsApiKey?: string;
}
