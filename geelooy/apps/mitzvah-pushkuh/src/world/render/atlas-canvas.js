// B"H
/**
 * The packed atlas canvas gathers many little lights into one garment.
 * Canvas fallback still sees raw images, but WebGL may now bind one texture
 * and travel by named UV regions instead of wandering texture to texture.
 */
import { buildAtlasLayout } from "./atlas-layout.js";

export function buildAtlasCanvas(atlas, make = defaultCanvas) {
  const layout = buildAtlasLayout(atlas);
  const canvas = make(layout.width, layout.height);
  const ctx = canvas.getContext?.("2d");
  if (!ctx) return { canvas: null, layout, ready: false };
  for (const name of layout.names()) {
    const r = layout.get(name);
    if (r?.img) ctx.drawImage(r.img, r.x, r.y, r.w, r.h);
  }
  return { canvas, layout, ready: true, get: name => layout.get(name) };
}

function defaultCanvas(w, h) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas"); c.width = w; c.height = h; return c;
}
