/* B"H
 * Source overlay conductor: bounds and crop are split into their own sparks.
 */
import { drawSourceBounds } from './sourceOverlayBounds.js';
import { drawCropOverlay } from './sourceOverlayCrop.js';

export function drawSourceOverlay(ctx, source, selected, index, options = {}) {
  if (!source.visible) return;
  ctx.save(); drawSourceBounds(ctx, source, selected, index);
  if (selected && options.tool === 'crop') drawCropOverlay(ctx, source);
  ctx.restore();
}
