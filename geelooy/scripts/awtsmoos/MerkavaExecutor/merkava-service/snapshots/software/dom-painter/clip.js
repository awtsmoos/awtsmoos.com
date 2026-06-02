// B"H
import { innerRect, intersectRects, intersects } from "./geometry.js";
import { clipsOverflow } from "./overflowPainter.js";

/**
 * Clip oracle: while the full framebuffer clip stack sleeps for a future day,
 * this culls fully escaped descendants so scroll/hidden vessels stop leaking.
 */
export function visibleInsideAncestors(item, byNode) {
  const clip = clipFor(item, byNode);
  return !clip || intersects(item, clip);
}

export function clipFor(item, byNode) {
  let node = item.node?.parentNode;
  let clip = null;
  while (node) {
    const parent = byNode.get(node);
    if (parent && clipsOverflow(parent)) clip = intersectRects(clip, innerRect(parent));
    node = node.parentNode;
  }
  return clip;
}
