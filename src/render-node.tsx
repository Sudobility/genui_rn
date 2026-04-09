import * as React from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import {
  Box,
  Button,
  HStack,
  Input,
  Select,
  Stack,
  Switch,
  Text,
  TextArea,
} from '@sudobility/components-rn';
import type { SelectOption } from '@sudobility/components-rn';
import { cn, colors, ui } from '@sudobility/design';
import { WebView } from 'react-native-webview';
import Slider from '@react-native-community/slider';
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

interface RenderNodeProps {
  renderable: IRenderable;
  onAction?: GenUIActionHandler;
}

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
      className='h-10 w-10 rounded-md'
      resizeMode='cover'
      accessibilityElementsHidden
    />
  );
};

const titleBlock = (view: IRenderableView) => {
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
      {details ? (
        <Text
          size='sm'
          color='muted'
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
  'map',
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
  'link',
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
  const isHorizontal =
    view.layout === 'stacked_horizontal' || view.layout === 'spaced_horizontal';

  return (
    <Box
      p='md'
      rounded='lg'
      border
      className={cn(
        'w-full',
        resolveViewModifierClasses(view.modifier),
        !view.modifier?.borderColor && 'border-slate-200'
      )}
    >
      <Stack spacing='md'>
        {titleBlock(view)}
        <View
          className={cn(
            isGrid
              ? 'flex-row flex-wrap gap-4'
              : isHorizontal
                ? 'flex-row flex-nowrap gap-4'
                : 'flex-col gap-4'
          )}
          style={resolveDimensionStyle(view.modifier)}
        >
          {isGrid
            ? view.children?.map(child => (
                <View key={child.id} className='w-[48%]'>
                  <RenderNode renderable={child} onAction={onAction} />
                </View>
              ))
            : renderChildren(view.children, onAction)}
        </View>
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
    <View className='w-full'>
      {titleBlock(view) ? (
        <View className='mb-4'>{titleBlock(view)}</View>
      ) : null}
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
    </View>
  );
};

const renderAction = (
  renderable: IRenderable,
  view: IRenderableView,
  onAction?: GenUIActionHandler
) => {
  const value = actionValueOf(renderable);
  const disabled = !onAction || value === undefined;
  const title = labelText(view.title) || renderable.id;

  return (
    <Button
      variant='secondary'
      disabled={disabled}
      className={cn(
        'w-full justify-start',
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

interface InteractiveNodeProps {
  renderable: IRenderable;
  view: IRenderableView;
  onAction?: GenUIActionHandler;
}

const InputNode: React.FC<InteractiveNodeProps> = ({
  renderable,
  view,
  onAction,
}) => {
  const [value, setValue] = React.useState(view.valueText?.text ?? '');
  const title = labelText(view.title);
  const helper = labelText(view.subtitle);

  const emit = (nextValue: string) => {
    setValue(nextValue);
    onAction?.(nextValue, renderable);
  };

  return (
    <Box
      p='md'
      rounded='lg'
      border
      className={cn(
        'w-full',
        resolveViewModifierClasses(view.modifier),
        !view.modifier?.borderColor && 'border-slate-200'
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
        {helper ? (
          <Text size='sm' color='muted'>
            {helper}
          </Text>
        ) : null}
      </Stack>
    </Box>
  );
};

const renderToggle = (
  renderable: IRenderable,
  view: IRenderableView,
  onAction?: GenUIActionHandler
) => {
  const checked = ['1', 'true', 'yes', 'on'].includes(
    (view.valueText?.text ?? '').toLowerCase()
  );

  return (
    <Box
      p='md'
      rounded='lg'
      border
      className={cn(
        'w-full border-slate-200',
        resolveViewModifierClasses(view.modifier)
      )}
    >
      <HStack justify='between' align='center' full>
        {titleBlock(view)}
        <Switch
          checked={checked}
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

  return (
    <Box
      p='md'
      rounded='lg'
      border
      className={cn(
        'w-full border-slate-200',
        resolveViewModifierClasses(view.modifier)
      )}
    >
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
          minimumTrackTintColor={colors.raw.blue[600]}
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

const renderSelect = (
  renderable: IRenderable,
  view: IRenderableView,
  onAction?: GenUIActionHandler
) => {
  const children = view.children ?? [];
  const options: SelectOption[] = children.map(option => {
    const optionView = option.view;
    const optionValue =
      actionValueOf(option) ?? optionView?.valueText?.text ?? option.id;
    const optionLabel =
      optionView?.title?.text ?? optionView?.valueText?.text ?? option.id;

    return { label: optionLabel, value: optionValue };
  });

  const defaultValue =
    view.valueText?.text ?? (options.length > 0 ? options[0].value : undefined);

  return (
    <Box
      p='md'
      rounded='lg'
      border
      className={cn(
        'w-full border-slate-200',
        resolveViewModifierClasses(view.modifier)
      )}
    >
      <Stack spacing='sm'>
        {titleBlock(view)}
        <Select
          value={defaultValue}
          options={options}
          placeholder='Select an option'
          title={labelText(view.title) || renderable.id}
          onValueChange={v => onAction?.(v, renderable)}
        />
      </Stack>
    </Box>
  );
};

const renderSpacer = (view: IRenderableView) => (
  <View
    accessibilityElementsHidden
    style={{
      width: view.modifier?.width ?? undefined,
      height: view.modifier?.height ?? 16,
    }}
  />
);

const renderWaiting = (view: IRenderableView) => (
  <View
    className={cn(
      'flex w-full flex-row items-center justify-center py-8',
      resolveViewModifierClasses(view.modifier)
    )}
  >
    <ActivityIndicator
      size='small'
      color={colors.semantic.text.secondary.light}
    />
    {labelText(view.title) ? (
      <Text size='sm' color='muted' className='ml-3'>
        {labelText(view.title)}
      </Text>
    ) : null}
  </View>
);

const renderWeb = (view: IRenderableView) => {
  const url = view.url?.url;
  if (!url) {
    return null;
  }

  return (
    <View
      className={cn(
        'w-full overflow-hidden rounded-lg border border-slate-200',
        resolveViewModifierClasses(view.modifier)
      )}
      style={{
        height: view.modifier?.height ?? 400,
        width: view.modifier?.width ?? undefined,
      }}
    >
      <WebView source={{ uri: url }} />
    </View>
  );
};

const renderCenter = (view: IRenderableView, onAction?: GenUIActionHandler) => (
  <View
    className={cn(
      'flex w-full flex-col items-center justify-center gap-2 py-4',
      resolveViewModifierClasses(view.modifier)
    )}
    style={resolveDimensionStyle(view.modifier)}
  >
    {view.layout === 'center_image'
      ? renderImage(view.image ?? view.icon)
      : null}
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
  </View>
);

const renderJustImage = (view: IRenderableView) => {
  const src = imageSrc(view.image ?? view.icon);
  if (!src) {
    return null;
  }

  return (
    <Image
      source={{ uri: src }}
      className={cn('rounded-lg', resolveViewModifierClasses(view.modifier))}
      resizeMode='cover'
      style={{
        width: view.modifier?.width ?? '100%',
        height: view.modifier?.height ?? 200,
      }}
      accessibilityLabel={labelText(view.title) || ''}
    />
  );
};

const renderEmbeddedImage = (
  view: IRenderableView,
  onAction?: GenUIActionHandler
) => {
  const src = imageSrc(view.image ?? view.icon);

  return (
    <View
      className={cn('w-full', resolveViewModifierClasses(view.modifier))}
      style={resolveDimensionStyle(view.modifier)}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          className='mb-2 w-full rounded-lg'
          resizeMode='cover'
          style={{ height: 200 }}
          accessibilityLabel={labelText(view.title) || ''}
        />
      ) : null}
      {titleBlock(view)}
      {view.children?.length ? renderChildren(view.children, onAction) : null}
    </View>
  );
};

const renderParagraph = (view: IRenderableView) => {
  const title = labelText(view.title);
  const detail = labelText(view.details);
  const text = title || detail || view.valueText?.text || '';

  if (!text) {
    return null;
  }

  return (
    <View
      className={cn('w-full', resolveViewModifierClasses(view.modifier))}
      style={resolveDimensionStyle(view.modifier)}
    >
      <Text
        className={resolveTextClasses(
          view.title?.modifier ??
            view.details?.modifier ??
            view.valueText?.modifier
        )}
      >
        {text}
      </Text>
    </View>
  );
};

const renderFooter = (view: IRenderableView) => {
  const text =
    labelText(view.title) ||
    labelText(view.details) ||
    view.valueText?.text ||
    '';

  if (!text) {
    return null;
  }

  return (
    <View
      className={cn('w-full py-2', resolveViewModifierClasses(view.modifier))}
      style={resolveDimensionStyle(view.modifier)}
    >
      <Text
        size='xs'
        color='muted'
        align='center'
        className={resolveTextClasses(view.title?.modifier)}
      >
        {text}
      </Text>
    </View>
  );
};

const renderLine = (view: IRenderableView) => {
  const hasImage = view.layout?.startsWith('line_image');
  const title = labelText(view.title);
  const subtitle = labelText(view.subtitle);
  const value = view.valueText?.text;
  const detail = labelText(view.details);

  return (
    <View
      className={cn(
        'flex-row items-center gap-3 py-2',
        resolveViewModifierClasses(view.modifier)
      )}
      style={resolveDimensionStyle(view.modifier)}
    >
      {hasImage ? renderImage(view.image ?? view.icon) : null}
      <View className='min-w-0 flex-1'>
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
      </View>
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
    </View>
  );
};

const renderBasicCard = (
  view: IRenderableView,
  onAction?: GenUIActionHandler
) => (
  <View
    className={cn(
      'w-full rounded-lg border border-slate-200 p-4',
      ui.background.surface,
      resolveViewModifierClasses(view.modifier)
    )}
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
  </View>
);

export const RenderNode: React.FC<RenderNodeProps> = ({
  renderable,
  onAction,
}) => {
  const view = viewOf(renderable);

  if (!view) {
    return null;
  }

  const layout = view.layout ?? '';

  if (layout === 'spacer_horizontal' || layout === 'spacer_vertical') {
    return renderSpacer(view);
  }

  if (layout === 'waiting') {
    return renderWaiting(view);
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
    return renderParagraph(view);
  }

  if (layout === 'footer') {
    return renderFooter(view);
  }

  if (LineLayouts.has(layout)) {
    return renderLine(view);
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
    return renderToggle(renderable, view, onAction);
  }

  if (layout === 'line_slider') {
    return (
      <SliderNode renderable={renderable} view={view} onAction={onAction} />
    );
  }

  if (layout === 'line_select') {
    return renderSelect(renderable, view, onAction);
  }

  if (ActionLayouts.has(layout)) {
    return renderAction(renderable, view, onAction);
  }

  return renderBasicCard(view, onAction);
};
