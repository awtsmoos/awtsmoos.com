/**
 * B"H
 * Render surface with Android-aware backbuffer choice.
 *
 * Chapter 54: not every phone wants an extra canvas copy. Android receives a
 * lean path; desktop may keep the backbuffer where it helps.
 */
export function createRenderSurface(canvas, profile = {}) {
  const visible = canvas.getContext('2d', { alpha: false, desynchronized: true });
  const offscreen = profile.backbuffer === false ? null : makeBackbuffer(canvas);
  const ctx = offscreen?.getContext?.('2d', { alpha: false, desynchronized: true }) || visible;
  return { canvas, visible, ctx, offscreen, usesBackbuffer: ctx !== visible, profile };
}

export function resizeRenderSurface(surface, cssW, cssH, dpr) {
  const pixelW = Math.max(1, Math.floor(cssW * dpr));
  const pixelH = Math.max(1, Math.floor(cssH * dpr));
  surface.canvas.width = pixelW;
  surface.canvas.height = pixelH;
  if (surface.offscreen) { surface.offscreen.width = pixelW; surface.offscreen.height = pixelH; }
  surface.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  surface.ctx.imageSmoothingEnabled = !surface.profile?.android;
  surface.visible.setTransform(1, 0, 0, 1, 0, 0);
  surface.visible.imageSmoothingEnabled = !surface.profile?.android;
}

export function presentRenderSurface(surface) {
  if (!surface.usesBackbuffer) return;
  surface.visible.setTransform(1, 0, 0, 1, 0, 0);
  surface.visible.drawImage(surface.offscreen, 0, 0);
}

function makeBackbuffer(canvas) {
  if (typeof OffscreenCanvas === 'function') return new OffscreenCanvas(canvas.width || 1, canvas.height || 1);
  const doc = canvas.ownerDocument;
  if (!doc) return null;
  const buffer = doc.createElement('canvas');
  buffer.width = canvas.width || 1;
  buffer.height = canvas.height || 1;
  return buffer;
}
