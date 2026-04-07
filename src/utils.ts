import type {
  IRenderable,
  IRenderableAction,
  IRenderableImage,
  IRenderableLabel,
  IRenderableScreen,
  IRenderableView,
} from './types';
import type { KeyboardTypeOptions } from 'react-native';

export const isRenderableScreen = (
  destination?: IRenderableAction | IRenderableScreen | null
): destination is IRenderableScreen =>
  Boolean(destination && 'view' in destination);

export const labelText = (label?: IRenderableLabel | null): string =>
  label?.text ?? '';

export const imageSrc = (image?: IRenderableImage | null): string | undefined =>
  image?.url ?? image?.local ?? undefined;

export const actionValueOf = (renderable: IRenderable): string | undefined => {
  const value = renderable.destination?.value;
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  const viewValue = renderable.view?.valueText?.text;
  if (typeof viewValue === 'string' && viewValue.length > 0) {
    return viewValue;
  }

  return undefined;
};

export const viewOf = (renderable: IRenderable): IRenderableView | undefined =>
  renderable.view ??
  (isRenderableScreen(renderable.destination)
    ? renderable.destination.view
    : undefined);

export const isInputLayout = (layout?: string | null): boolean =>
  layout === 'input_text' ||
  layout === 'input_numeric' ||
  layout === 'input_password' ||
  layout === 'input_email' ||
  layout === 'input_phone' ||
  layout === 'input_date' ||
  layout === 'input_text_block' ||
  layout === 'search';

export const keyboardTypeForLayout = (
  layout?: string | null
): KeyboardTypeOptions => {
  switch (layout) {
    case 'input_numeric':
      return 'numeric';
    case 'input_email':
      return 'email-address';
    case 'input_phone':
      return 'phone-pad';
    default:
      return 'default';
  }
};

export const isSecureTextEntry = (layout?: string | null): boolean =>
  layout === 'input_password';
