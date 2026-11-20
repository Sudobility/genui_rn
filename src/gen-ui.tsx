import * as React from 'react';
import { Box } from '@sudobility/components-rn';
import { cn } from '@sudobility/design';
import type { GenUIProps } from './types';
import { RenderNode } from './render-node';

// `googleMapsApiKey` is part of `GenUIProps` so one call site serves both
// renderers, but it is not read here: see the note on the prop.
export const GenUI: React.FC<GenUIProps> = ({
  renderable,
  onAction,
  className,
}) => {
  return (
    <Box className={cn('w-full', className)}>
      <RenderNode renderable={renderable} onAction={onAction} />
    </Box>
  );
};
