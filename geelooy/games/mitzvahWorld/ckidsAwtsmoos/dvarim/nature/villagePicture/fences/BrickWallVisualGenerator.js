// B"H
/** @file BrickWallVisualGenerator.js @description One-buffer masonry wrapper for yard walls. */
import { buildBrickStructure } from "../masonry/brickStructure.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function buildBrickWallVisual(group, segment = {}) {
  const dx = (segment.end.x || 0) - (segment.start.x || 0), dz = (segment.end.z || 0) - (segment.start.z || 0);
  const length = Math.hypot(dx, dz);
  return buildBrickStructure(group, { name: segment.id || "yard_brick_wall", spans: [{ length, height: segment.height || 1, depth: segment.thickness || 0.35 }], panels: [] });
}
export default { buildBrickWallVisual };
