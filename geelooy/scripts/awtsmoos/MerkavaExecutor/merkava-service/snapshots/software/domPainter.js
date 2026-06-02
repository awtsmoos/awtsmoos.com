// B"H
/**
 * @file domPainter.js
 * @description
 * Main DOM painter entry. The old monolith was split into navy submodules:
 * geometry, style, clipping, overflow, text, canvas selection, and box paint.
 * The Awtsmoos now conducts the orchestra instead of hiding every instrument
 * inside one swollen scroll of code.
 */
import { pickCanvasTexture } from "./dom-painter/canvasPicker.js";
import { paintBox } from "./dom-painter/boxPainter.js";
import { visibleInsideAncestors } from "./dom-painter/clip.js";
import { shouldShowScrollbar, paintScrollbar } from "./dom-painter/overflowPainter.js";
import { paintTextItem } from "./dom-painter/textPainter.js";

export function paintLayout(fb, layout, canvas = {}) {
  const textures = [...(canvas.textures || [])];
  const used = new Set();
  const byNode = new Map(layout.map(item => [item.node, item]));
  for (const item of layout) {
    if (!visibleInsideAncestors(item, byNode)) continue;
    if (item.kind === "#text") paintTextItem(fb, item);
    else paintBox(fb, item, pickCanvasTexture(item, textures, used), textures);
  }
  for (const item of layout) if (shouldShowScrollbar(item)) paintScrollbar(fb, item);
}
