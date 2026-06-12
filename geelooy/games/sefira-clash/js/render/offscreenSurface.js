/**
 * B"H
 * OffscreenCanvas-compatible render surface.
 *
 * Chapter 248: where the browser permits it, the frame is painted into an
 * offscreen backbuffer first, then copied to the visible canvas. This is the
 * safe doorway toward worker rendering without breaking DOM-bound menu logic.
 */
export function createRenderSurface(canvas) {
  const visible = canvas.getContext('2d', { alpha: false, desynchronized: true });
  const offscreen = makeBackbuffer(canvas);
  const ctx = offscreen?.getContext?.('2d', { alpha: false, desynchronized: true }) || visible;
  return { canvas, visible, ctx, offscreen, usesBackbuffer: ctx !== visible };
}

export function resizeRenderSurface(surface, cssW, cssH, dpr) {
  const pixelW = Math.max(1, Math.floor(cssW * dpr));
  const pixelH = Math.max(1, Math.floor(cssH * dpr));
  surface.canvas.width = pixelW;
  surface.canvas.height = pixelH;
  if (surface.offscreen) {
    surface.offscreen.width = pixelW;
    surface.offscreen.height = pixelH;
  }
  surface.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  surface.ctx.imageSmoothingEnabled = true;
  surface.visible.setTransform(1, 0, 0, 1, 0, 0);
  surface.visible.imageSmoothingEnabled = true;
}

export function presentRenderSurface(surface) {
  if (!surface.usesBackbuffer) return;
  surface.visible.setTransform(1, 0, 0, 1, 0, 0);
  surface.visible.drawImage(surface.offscreen, 0, 0);
}

export function supportsWorkerOffscreen(canvas) {
  return typeof Worker !== 'undefined' && typeof canvas.transferControlToOffscreen === 'function';
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
