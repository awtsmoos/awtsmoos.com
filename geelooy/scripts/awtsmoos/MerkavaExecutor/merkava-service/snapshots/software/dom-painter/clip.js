// B"H
import { innerRect } from "./geometry.js";
import { overflowValue } from "./styleTools.js";

/**
 * Clip oracle (B"H 2026-10-09: axis-aware).
 *
 * Each overflow:hidden/scroll/auto ancestor contributes its inner rect on the
 * clipped axis ONLY, so `overflow-x:hidden; overflow-y:visible` clips
 * horizontally while letting content spill vertically — matching browsers.
 *
 * clipFor returns {x0,y0,x1,y1} with -/+Infinity on unclipped axes, or null
 * when no ancestor clips. The DOM painter pushes this rect as a real pixel
 * clip around each item's paint (framebuffer honoring it in setPixel).
 */
const CLIPPED = new Set(["hidden", "scroll", "auto"]);

export function clipFor(item, byNode) {
  let node = item.node?.parentNode;
  let x0 = -Infinity, x1 = Infinity, y0 = -Infinity, y1 = Infinity, any = false;
  while (node) {
    const parent = byNode.get(node);
    if (parent) {
      const ov = overflowValue(parent.style || {});
      // B"H 2026-10-09: contain:paint (also via content/strict) clips
      // descendants to the padding box exactly like overflow:hidden —
      // paint containment's whole point is nothing escapes the box.
      const c = String((parent.style || {}).contain || "").toLowerCase().split(/\s+/);
      const paintContain = c.includes("paint") || c.includes("content") || c.includes("strict");
      if (CLIPPED.has(ov.x) || paintContain) {
        const r = innerRect(parent);
        if (r.x > x0) x0 = r.x;
        if (r.x + r.width < x1) x1 = r.x + r.width;
        any = true;
      }
      if (CLIPPED.has(ov.y) || paintContain) {
        const r = innerRect(parent);
        if (r.y > y0) y0 = r.y;
        if (r.y + r.height < y1) y1 = r.y + r.height;
        any = true;
      }
    }
    node = node.parentNode;
  }
  return any ? { x0, y0, x1, y1 } : null;
}

export function visibleInsideAncestors(item, byNode) {
  const clip = clipFor(item, byNode);
  if (!clip) return true;
  const ix = item.x || 0, iy = item.y || 0;
  const ix0 = Math.max(ix, clip.x0), ix1 = Math.min(ix + (item.width || 0), clip.x1);
  const iy0 = Math.max(iy, clip.y0), iy1 = Math.min(iy + (item.height || 0), clip.y1);
  return ix1 > ix0 && iy1 > iy0;
}
