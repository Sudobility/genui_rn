import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import {
  Box,
  Button,
  DateInput,
  HStack,
  Input,
  Select,
  Stack,
  Switch,
  Text,
  TextArea,
} from '@sudobility/components-rn';
import type { SelectOption } from '@sudobility/components-rn';
import { cn } from '@sudobility/design';
import { defaultTheme } from '@sudobility/design/themes';
import { WebView } from 'react-native-webview';
import Slider from '@react-native-community/slider';
import MapView, { Marker as MapMarker } from 'react-native-maps';
import type { GenUIActionHandler, IRenderable, IRenderableView } from './types';
import {
  actionValueOf,
  imageSrc,
  isInputLayout,
  isSecureTextEntry,
  keyboardTypeForLayout,
  labelText,
  viewOf,
} from './utils';
import {
  resolveDimensionStyle,
  resolveTextClasses,
  resolveViewModifierClasses,
} from './theme';

// ---------------------------------------------------------------------------
// This file is the React Native mirror of `@sudobility/genui`'s
// `render-node.tsx`: the same dispatch table, the same parts in the same
// order, the same wording and the same `onAction` contract. Keep the two in
// step — when the web renderer changes, port the change here.
//
// Styling rule: `className` goes ONLY on `@sudobility/components-rn`
// components (`Box`, `Stack`, `Text`, `Button`, …), never on a core React
// Native component. NativeWind compiles `className` in JSX the consuming app's
// Babel sees; a core `View`/`Image`/`Text` reached through a precompiled build
// would silently drop it. Core components here are styled with `style`.
// ---------------------------------------------------------------------------

interface RenderNodeProps {
  renderable: IRenderable;
  onAction?: GenUIActionHandler;
}

// Some native components (Slider tint, ActivityIndicator) take a concrete color
// string and cannot use a `className`. Derive these from the same design-system
// tokens the rest of the tree uses (per the active color scheme) instead of
// hardcoding a parallel palette. Design tokens are HSL channel strings
// ("222.2 84% 4.9%"); React Native's parser wants the comma form.
const hsl = (channels: string): string => {
  const [h, s, l] = channels.trim().split(/\s+/);
  return `hsl(${h}, ${s}, ${l})`;
};

// A list (`list*`) draws its rows as one rounded block: no gap between rows and
// no rounding on the action buttons inside it. The web does this with a
// descendant selector (`[&_button]:rounded-none`); React Native has none, so
// the list tells its descendants through context.
const InListContext = React.createContext(false);

const renderImage = (
  image?:
    | IRenderableView['image']
    | IRenderableView['icon']
    | IRenderableView['background']
) => {
  const src = imageSrc(image);
  if (!src) {
    return null;
  }

  return (
    <Image
      source={{ uri: src }}
      style={styles.thumbnail}
      resizeMode='cover'
      accessibilityElementsHidden
      importantForAccessibility='no'
    />
  );
};

const titleBlock = (view: IRenderableView, align?: 'center') => {
  const title = labelText(view.title);
  const subtitle = labelText(view.subtitle);
  const details = labelText(view.details);

  if (!title && !subtitle && !details) {
    return null;
  }

  return (
    <Stack spacing='xs' className='min-w-0 flex-1'>
      {title ? (
        <Text
          weight='semibold'
          align={align}
          className={resolveTextClasses(view.title?.modifier)}
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          size='sm'
          color='muted'
          align={align}
          className={resolveTextClasses(view.subtitle?.modifier)}
        >
          {subtitle}
        </Text>
      ) : null}
      {details ? (
        <Text
          size='sm'
          color='muted'
          align={align}
          className={resolveTextClasses(view.details?.modifier)}
        >
          {details}
        </Text>
      ) : null}
    </Stack>
  );
};

const CollectionLayouts = new Set([
  'list',
  'list_simple',
  'list_sectioned',
  'list_paragraphs',
  'grid',
  'grid_simple',
  'grid_sectioned',
  'carousel',
  'calendar',
  'stacked',
  'stacked_horizontal',
  'stacked_vertical',
  'stacked_dynamic',
  'tabs_fixed',
  'tabs_scrollable',
  'spaced_horizontal',
  'spaced_vertical',
  'header',
]);

const ActionLayouts = new Set([
  'action',
  'line_action',
  'fab',
  'fab_mini',
  'fab_extended',
  'nav_item',
  'nav_image_item',
  'tile',
  'chip',
]);

const LineLayouts = new Set([
  'line_title',
  'line_text',
  'line_title_value',
  'line_title_subtitle',
  'line_title_subtitle_value',
  'line_title_detail',
  'line_image_title',
  'line_image_title_subtitle',
  'line_image_title_subtitle_value',
]);

const renderChildren = (
  children: IRenderable[] | null | undefined,
  onAction?: GenUIActionHandler
) => {
  if (!children?.length) {
    return null;
  }

  return children.map(child => (
    <RenderNode key={child.id} renderable={child} onAction={onAction} />
  ));
};

const renderCollection = (
  _renderable: IRenderable,
  view: IRenderableView,
  onAction?: GenUIActionHandler
) => {
  const isGrid = view.layout?.startsWith('grid');
  const isList = view.layout?.startsWith('list');
  const isHorizontal =
    view.layout === 'stacked_horizontal' || view.layout === 'spaced_horizontal';

  const body = (
    <Box
      className={cn(
        isGrid
          ? 'flex-row flex-wrap gap-4'
          : isHorizontal
            ? 'flex-row flex-nowrap gap-4'
            : isList
              ? 'flex-col overflow-hidden rounded-lg'
              : 'flex-col gap-4'
      )}
      style={resolveDimensionStyle(view.modifier)}
    >
      {isGrid
        ? (view.children ?? []).map(child => (
            // One column on a phone, two from the `md` breakpoint — the web's
            // `grid-cols-1 md:grid-cols-2` — in 4:3 cells (16:9 from `lg`).
            <Box
              key={child.id}
              className='aspect-[4/3] w-full overflow-hidden md:w-[48%] lg:aspect-video'
            >
              <RenderNode renderable={child} onAction={onAction} />
            </Box>
          ))
        : renderChildren(view.children, onAction)}
    </Box>
  );

  return (
    <Box className={cn('w-full', resolveViewModifierClasses(view.modifier))}>
      <Stack spacing='md'>
        {titleBlock(view)}
        {isList ? (
          <InListContext.Provider value={true}>{body}</InListContext.Provider>
        ) : (
          body
        )}
      </Stack>
    </Box>
  );
};

const renderCarousel = (
  _renderable: IRenderable,
  view: IRenderableView,
  onAction?: GenUIActionHandler
) => {
  const children = view.children ?? [];
  const { width } = Dimensions.get('window');
  const itemWidth = width * 0.8;
  const gap = 16;

  return (
    <Box className='w-full overflow-hidden'>
      {titleBlock(view) ? <Box className='mb-4'>{titleBlock(view)}</Box> : null}
      <FlatList
        data={children}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth + gap}
        decelerationRate='fast'
        contentContainerStyle={{
          paddingHorizontal: (width - itemWidth) / 2,
          gap,
        }}
        renderItem={({ item }) => (
          <View style={{ width: itemWidth }}>
            <RenderNode renderable={item} onAction={onAction} />
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Map (react-native-maps)
//
// The web draws maps with Google Maps JS and so needs `googleMapsApiKey`; a
// native map takes its key from the app's native configuration, so the maps
// below render without one (see `GenUIProps.googleMapsApiKey`).
// ---------------------------------------------------------------------------

const computeRegion = (
  locations: { lat: number; long: number }[]
): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} => {
  const lats = locations.map(l => l.lat);
  const lngs = locations.map(l => l.long);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01);
  const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.01);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
};

const renderMapPin = (renderable: IRenderable, view: IRenderableView) => {
  const loc = renderable.location;
  if (!loc) return null;

  const title = labelText(view.title);
  // The web opens an info window holding the subtitle and the details, one
  // under the other; a native callout has a single description line.
  const description = [labelText(view.subtitle), labelText(view.details)]
    .filter(Boolean)
    .join('\n');

  return (
    <Box className={cn('w-full', resolveViewModifierClasses(view.modifier))}>
      <Stack spacing='md'>
        {titleBlock(view)}
        <Box
          className='overflow-hidden'
          style={{ height: view.modifier?.height ?? 300 }}
        >
          <MapView
            style={styles.fill}
            initialRegion={{
              latitude: loc.lat,
              longitude: loc.long,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <MapMarker
              coordinate={{ latitude: loc.lat, longitude: loc.long }}
              title={title || undefined}
              description={description || undefined}
            />
          </MapView>
        </Box>
      </Stack>
    </Box>
  );
};

const renderMap = (
  _renderable: IRenderable,
  view: IRenderableView,
  onAction?: GenUIActionHandler
) => {
  const children = view.children ?? [];
  const locatedChildren = children.filter(c => c.location);

  if (locatedChildren.length === 0) {
    return (
      <Box className='w-full'>
        <Stack spacing='md'>
          {titleBlock(view)}
          <Text size='sm' color='muted'>
            No locations to display.
          </Text>
        </Stack>
      </Box>
    );
  }

  const region = computeRegion(locatedChildren.map(c => c.location!));

  return (
    <Box className={cn('w-full', resolveViewModifierClasses(view.modifier))}>
      <Stack spacing='md'>
        {titleBlock(view)}
        <Box
          className='overflow-hidden'
          style={{ height: view.modifier?.height ?? 400 }}
        >
          <MapView style={styles.fill} initialRegion={region}>
            {locatedChildren.map(child => {
              const childView = child.view;
              const pinTitle = labelText(childView?.title);
              const value = actionValueOf(child);

              return (
                <MapMarker
                  key={child.id}
                  coordinate={{
                    latitude: child.location!.lat,
                    longitude: child.location!.long,
                  }}
                  title={pinTitle || undefined}
                  onPress={
                    onAction && value !== undefined
                      ? () => onAction(value, child)
                      : undefined
                  }
                />
              );
            })}
          </MapView>
        </Box>
      </Stack>
    </Box>
  );
};

const renderLink = (view: IRenderableView) => {
  const url = view.url?.url;
  const title = labelText(view.title);

  if (!url && !title) {
    return null;
  }

  return url ? (
    <Pressable
      accessibilityRole='link'
      style={styles.link}
      onPress={() => {
        // The web opens the link in a new tab; here the system opens it.
        Linking.openURL(url).catch(() => undefined);
      }}
    >
      <Text
        size='sm'
        color='primary'
        className={cn('underline', resolveViewModifierClasses(view.modifier))}
      >
        {title || url}
      </Text>
    </Pressable>
  ) : (
    <Text size='sm' className={resolveTextClasses(view.title?.modifier)}>
      {title}
    </Text>
  );
};

interface InteractiveNodeProps {
  renderable: IRenderable;
  view: IRenderableView;
  onAction?: GenUIActionHandler;
}

const ActionNode: React.FC<InteractiveNodeProps> = ({
  renderable,
  view,
  onAction,
}) => {
  const inList = React.useContext(InListContext);
  const value = actionValueOf(renderable);
  const disabled = !onAction || value === undefined;
  const title = labelText(view.title) || renderable.id;

  return (
    <Button
      variant='secondary'
      disabled={disabled}
      className={cn(
        'justify-start',
        inList && 'rounded-none',
        resolveViewModifierClasses(view.buttonModifier ?? view.modifier)
      )}
      onPress={() => {
        if (!disabled && value !== undefined) {
          onAction(value, renderable);
        }
      }}
    >
      <HStack justify='between' align='center' full>
        <HStack align='center' spacing='sm'>
          {renderImage(view.image ?? view.icon)}
          <Stack spacing='xs'>
            <Text
              weight='semibold'
              className={resolveTextClasses(view.title?.modifier)}
            >
              {title}
            </Text>
            {view.subtitle?.text ? (
              <Text size='sm' color='muted'>
                {view.subtitle.text}
              </Text>
            ) : null}
          </Stack>
        </HStack>
        {view.valueText?.text ? (
          <Text size='sm' color='muted'>
            {view.valueText.text}
          </Text>
        ) : null}
      </HStack>
    </Button>
  );
};

/** `YYYY-MM-DD` as a local date, so the picker shows the day that was sent. */
const parseLocalDate = (value: string): Date | string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return value;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

const InputNode: React.FC<InteractiveNodeProps> = ({
  renderable,
  view,
  onAction,
}) => {
  const initialValue = view.valueText?.text ?? '';
  const [value, setValue] = React.useState(initialValue);
  const title = labelText(view.title);
  const helper = labelText(view.subtitle);

  // Report the initial value once, on mount (as the web does).
  React.useEffect(() => {
    if (initialValue) {
      onAction?.(initialValue, renderable);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = (nextValue: string) => {
    setValue(nextValue);
    onAction?.(nextValue, renderable);
  };

  return (
    <Box
      className={cn(
        'w-full rounded-lg bg-muted p-3',
        resolveViewModifierClasses(view.modifier)
      )}
    >
      <Stack spacing='sm'>
        {title ? (
          <Text
            size='sm'
            weight='medium'
            className={resolveTextClasses(view.title?.modifier)}
          >
            {title}
          </Text>
        ) : null}
        {view.layout === 'input_text_block' ? (
          <TextArea
            value={value}
            onChangeText={emit}
            placeholder={helper || title || 'Enter text'}
            accessibilityLabel={title || renderable.id}
          />
        ) : view.layout === 'input_date' ? (
          // The web's `<input type="date">`: a date picker reporting
          // `YYYY-MM-DD`.
          <DateInput
            value={parseLocalDate(value)}
            onChange={emit}
            placeholder={helper || title || 'Enter value'}
          />
        ) : (
          <Input
            value={value}
            keyboardType={keyboardTypeForLayout(view.layout)}
            secureTextEntry={isSecureTextEntry(view.layout)}
            accessibilityLabel={title || renderable.id}
            placeholder={helper || title || 'Enter value'}
            onChangeText={emit}
          />
        )}
      </Stack>
    </Box>
  );
};

const ToggleNode: React.FC<InteractiveNodeProps> = ({
  renderable,
  view,
  onAction,
}) => {
  const initialValue = ['1', 'true', 'yes', 'on'].includes(
    (view.valueText?.text ?? '').toLowerCase()
  );

  // Report the initial value once, on mount (as the web does).
  React.useEffect(() => {
    onAction?.(initialValue ? 'true' : 'false', renderable);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box className={cn('w-full', resolveViewModifierClasses(view.modifier))}>
      <HStack justify='between' align='center' full>
        {titleBlock(view)}
        <Switch
          checked={initialValue}
          onCheckedChange={nextValue =>
            onAction?.(nextValue ? 'true' : 'false', renderable)
          }
        />
      </HStack>
    </Box>
  );
};

const SliderNode: React.FC<InteractiveNodeProps> = ({
  renderable,
  view,
  onAction,
}) => {
  const initialValue = Number(view.valueText?.text ?? 0);
  const [value, setValue] = React.useState(
    Number.isFinite(initialValue) ? initialValue : 0
  );
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? defaultTheme.dark : defaultTheme.light;

  // Report the initial value once, on mount (as the web does).
  React.useEffect(() => {
    onAction?.(String(value), renderable);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box className={cn('w-full', resolveViewModifierClasses(view.modifier))}>
      <Stack spacing='sm'>
        <HStack justify='between' align='center'>
          {titleBlock(view)}
          <Text size='sm' color='muted'>
            {value}
          </Text>
        </HStack>
        <Slider
          value={value}
          minimumValue={0}
          maximumValue={100}
          step={1}
          minimumTrackTintColor={hsl(tokens.primary)}
          onValueChange={nextValue => {
            const rounded = Math.round(nextValue);
            setValue(rounded);
            onAction?.(String(rounded), renderable);
          }}
          accessibilityLabel={labelText(view.title) || renderable.id}
        />
      </Stack>
    </Box>
  );
};

const SelectNode: React.FC<InteractiveNodeProps> = ({
  renderable,
  view,
  onAction,
}) => {
  const children = view.children ?? [];
  const options: SelectOption[] = children.map(option => {
    const optionView = option.view;
    const optionValue =
      actionValueOf(option) ?? optionView?.valueText?.text ?? option.id;
    const optionLabel =
      optionView?.title?.text ?? optionView?.valueText?.text ?? option.id;

    return { label: optionLabel, value: optionValue };
  });
  // What `onAction` reports is the option's LABEL, not its value (as the web
  // does); a value with no option reports itself.
  const labelByValue: Record<string, string> = {};
  for (const option of options) {
    labelByValue[option.value] = option.label;
  }

  const defaultValue =
    view.valueText?.text ??
    actionValueOf(children[0] ?? { id: '', destination: null, view: null });

  // The components-rn `Select` is controlled only, so the choice is held here.
  const [selected, setSelected] = React.useState(defaultValue);

  // Report the initial value once, on mount (as the web does).
  React.useEffect(() => {
    if (defaultValue) {
      onAction?.(labelByValue[defaultValue] ?? defaultValue, renderable);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box className={cn('w-full', resolveViewModifierClasses(view.modifier))}>
      <Stack spacing='sm'>
        {titleBlock(view)}
        <Select
          value={selected}
          options={options}
          placeholder='Select an option'
          title={labelText(view.title) || renderable.id}
          accessibilityLabel={labelText(view.title) || renderable.id}
          onValueChange={nextValue => {
            setSelected(nextValue);
            onAction?.(labelByValue[nextValue] ?? nextValue, renderable);
          }}
        />
      </Stack>
    </Box>
  );
};

const renderSpacer = (view: IRenderableView) => (
  <View
    accessibilityElementsHidden
    importantForAccessibility='no'
    style={{
      width: view.modifier?.width ?? undefined,
      height: view.modifier?.height ?? 16,
    }}
  />
);

const WaitingNode: React.FC<{ view: IRenderableView }> = ({ view }) => {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? defaultTheme.dark : defaultTheme.light;

  return (
    <Box
      className={cn(
        'flex w-full flex-row items-center justify-center',
        resolveViewModifierClasses(view.modifier)
      )}
    >
      <ActivityIndicator size='small' color={hsl(tokens.mutedForeground)} />
      {labelText(view.title) ? (
        <Text size='sm' color='muted' className='ml-3'>
          {labelText(view.title)}
        </Text>
      ) : null}
    </Box>
  );
};

const renderWeb = (view: IRenderableView) => {
  const url = view.url?.url;
  if (!url) {
    return null;
  }

  return (
    <Box
      className={cn('w-full', resolveViewModifierClasses(view.modifier))}
      style={{
        height: view.modifier?.height ?? 400,
        width: view.modifier?.width ?? undefined,
      }}
    >
      <WebView
        source={{ uri: url }}
        accessibilityLabel={labelText(view.title) || 'Embedded content'}
      />
    </Box>
  );
};

const renderCenter = (view: IRenderableView, onAction?: GenUIActionHandler) => (
  <Box
    className={cn(
      'flex w-full flex-col items-center justify-center gap-2',
      resolveViewModifierClasses(view.modifier)
    )}
    style={resolveDimensionStyle(view.modifier)}
  >
    {view.layout === 'center_image'
      ? renderImage(view.image ?? view.icon)
      : null}
    {titleBlock(view, 'center')}
    {view.valueText?.text ? (
      <Text
        size='sm'
        color='muted'
        align='center'
        className={resolveTextClasses(view.valueText.modifier)}
      >
        {view.valueText.text}
      </Text>
    ) : null}
    {view.children?.length ? renderChildren(view.children, onAction) : null}
  </Box>
);

// A remote image has no intrinsic size in React Native, so where the web lets
// the image take its natural height these fall back to a fixed one.
const IMAGE_FALLBACK_HEIGHT = 200;

const renderJustImage = (view: IRenderableView) => {
  const src = imageSrc(view.image ?? view.icon);
  if (!src) {
    return null;
  }

  return (
    <Box
      className={resolveViewModifierClasses(view.modifier)}
      style={{
        width: view.modifier?.width ?? '100%',
        height: view.modifier?.height ?? IMAGE_FALLBACK_HEIGHT,
      }}
    >
      <Image
        source={{ uri: src }}
        style={styles.fillImage}
        resizeMode='cover'
        accessibilityLabel={labelText(view.title) || ''}
      />
    </Box>
  );
};

const renderEmbeddedImage = (
  view: IRenderableView,
  onAction?: GenUIActionHandler
) => {
  const src = imageSrc(view.image ?? view.icon);

  return (
    <Box
      className={cn('w-full', resolveViewModifierClasses(view.modifier))}
      style={resolveDimensionStyle(view.modifier)}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          style={styles.embeddedImage}
          resizeMode='cover'
          accessibilityLabel={labelText(view.title) || ''}
        />
      ) : null}
      {titleBlock(view)}
      {view.children?.length ? renderChildren(view.children, onAction) : null}
    </Box>
  );
};

const renderParagraph = (
  view: IRenderableView,
  onAction?: GenUIActionHandler
) => {
  const title = labelText(view.title);
  const detail = labelText(view.details);

  if (!title && !detail && !view.children?.length) {
    return null;
  }

  return (
    <Box
      className={cn('w-full', resolveViewModifierClasses(view.modifier))}
      style={resolveDimensionStyle(view.modifier)}
    >
      <Stack spacing='sm'>
        {title ? (
          <Text
            weight='semibold'
            className={resolveTextClasses(view.title?.modifier)}
          >
            {title}
          </Text>
        ) : null}
        {detail ? (
          <Text
            color='muted'
            className={resolveTextClasses(view.details?.modifier)}
          >
            {detail}
          </Text>
        ) : null}
        {view.children?.length ? renderChildren(view.children, onAction) : null}
      </Stack>
    </Box>
  );
};

const renderFooter = (view: IRenderableView, onAction?: GenUIActionHandler) => {
  const text =
    labelText(view.title) ||
    labelText(view.details) ||
    view.valueText?.text ||
    '';

  if (!text && !view.children?.length) {
    return null;
  }

  return (
    <Box
      className={cn('w-full', resolveViewModifierClasses(view.modifier))}
      style={resolveDimensionStyle(view.modifier)}
    >
      {text ? (
        <Text
          size='xs'
          color='muted'
          align='center'
          className={resolveTextClasses(view.title?.modifier)}
        >
          {text}
        </Text>
      ) : null}
      {view.children?.length ? renderChildren(view.children, onAction) : null}
    </Box>
  );
};

const renderLine = (view: IRenderableView, onAction?: GenUIActionHandler) => {
  const hasImage = view.layout?.startsWith('line_image');
  const title = labelText(view.title);
  const subtitle = labelText(view.subtitle);
  const value = view.valueText?.text;
  const detail = labelText(view.details);

  return (
    <Box
      className={cn(
        'flex-row items-center gap-3',
        resolveViewModifierClasses(view.modifier)
      )}
      style={resolveDimensionStyle(view.modifier)}
    >
      {hasImage ? renderImage(view.image ?? view.icon) : null}
      <Box className='min-w-0 flex-1'>
        {title ? (
          <Text
            weight='medium'
            className={resolveTextClasses(view.title?.modifier)}
          >
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text
            size='sm'
            color='muted'
            className={resolveTextClasses(view.subtitle?.modifier)}
          >
            {subtitle}
          </Text>
        ) : null}
        {detail ? (
          <Text
            size='sm'
            color='muted'
            className={resolveTextClasses(view.details?.modifier)}
          >
            {detail}
          </Text>
        ) : null}
        {view.children?.length ? renderChildren(view.children, onAction) : null}
      </Box>
      {value ? (
        <Text
          size='sm'
          color='muted'
          className={cn(
            'shrink-0',
            resolveTextClasses(view.valueText?.modifier)
          )}
        >
          {value}
        </Text>
      ) : null}
    </Box>
  );
};

const renderBasicCard = (
  view: IRenderableView,
  onAction?: GenUIActionHandler
) => (
  <Box
    className={cn('w-full', resolveViewModifierClasses(view.modifier))}
    style={resolveDimensionStyle(view.modifier)}
  >
    <HStack align='start' spacing='sm'>
      {renderImage(view.image ?? view.icon)}
      <Stack spacing='sm' className='flex-1'>
        {titleBlock(view)}
        {view.valueText?.text ? (
          <Text
            size='sm'
            color='muted'
            className={resolveTextClasses(view.valueText.modifier)}
          >
            {view.valueText.text}
          </Text>
        ) : null}
        {view.children?.length ? renderChildren(view.children, onAction) : null}
      </Stack>
    </HStack>
  </Box>
);

export const RenderNode: React.FC<RenderNodeProps> = ({
  renderable,
  onAction,
}) => {
  const view = viewOf(renderable);

  if (!view) {
    return null;
  }

  // Merge top-level children into view (handles AI misplacing children on the renderable)
  const misplacedChildren = (renderable as unknown as Record<string, unknown>)
    .children as IRenderable[] | undefined;
  if (misplacedChildren?.length && !view.children?.length) {
    view.children = misplacedChildren;
  }

  const layout = view.layout ?? '';

  if (layout === 'spacer_horizontal' || layout === 'spacer_vertical') {
    return renderSpacer(view);
  }

  if (layout === 'waiting') {
    return <WaitingNode view={view} />;
  }

  if (layout === 'web') {
    return renderWeb(view);
  }

  if (layout === 'just_image') {
    return renderJustImage(view);
  }

  if (layout === 'center' || layout === 'center_image') {
    return renderCenter(view, onAction);
  }

  if (layout === 'embedded_image') {
    return renderEmbeddedImage(view, onAction);
  }

  if (layout === 'paragraph' || layout === 'text_markup') {
    return renderParagraph(view, onAction);
  }

  if (layout === 'footer') {
    return renderFooter(view, onAction);
  }

  if (LineLayouts.has(layout)) {
    return renderLine(view, onAction);
  }

  if (layout === 'map_pin') {
    return renderMapPin(renderable, view);
  }

  if (layout === 'map') {
    return renderMap(renderable, view, onAction);
  }

  if (layout === 'carousel') {
    return renderCarousel(renderable, view, onAction);
  }

  if (CollectionLayouts.has(layout)) {
    return renderCollection(renderable, view, onAction);
  }

  if (isInputLayout(view.layout)) {
    return (
      <InputNode renderable={renderable} view={view} onAction={onAction} />
    );
  }

  if (layout === 'line_toggle') {
    return (
      <ToggleNode renderable={renderable} view={view} onAction={onAction} />
    );
  }

  if (layout === 'line_slider') {
    return (
      <SliderNode renderable={renderable} view={view} onAction={onAction} />
    );
  }

  if (layout === 'line_select') {
    return (
      <SelectNode renderable={renderable} view={view} onAction={onAction} />
    );
  }

  if (layout === 'link') {
    return renderLink(view);
  }

  if (ActionLayouts.has(layout)) {
    return (
      <ActionNode renderable={renderable} view={view} onAction={onAction} />
    );
  }

  return renderBasicCard(view, onAction);
};

const styles = StyleSheet.create({
  // `h-10 w-10 rounded-md`
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  fill: {
    flex: 1,
  },
  fillImage: {
    width: '100%',
    height: '100%',
  },
  // `mb-2 w-full`
  embeddedImage: {
    width: '100%',
    height: IMAGE_FALLBACK_HEIGHT,
    marginBottom: 8,
  },
  link: {
    alignSelf: 'flex-start',
  },
});
