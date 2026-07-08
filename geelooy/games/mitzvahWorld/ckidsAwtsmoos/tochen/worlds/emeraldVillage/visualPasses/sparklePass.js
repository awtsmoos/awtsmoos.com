// B"H
/**
 * @file sparklePass.js
 * @description Chapter 483: Firefly count now scales, keeping wonder while
 * cutting tiny draw calls on old phones.
 */
import { ringPoints } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { SPARKLE_RING } from './sparkleConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addFirefly } from './sparkleFirefly.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { scaledCount } from './visualDensityConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addSparkles(n, density = {}) {
  const count = scaledCount(SPARKLE_RING.count, density.sparkleScale ?? 1, 12);
  ringPoints(count, SPARKLE_RING.radius, SPARKLE_RING.x, SPARKLE_RING.z).forEach((pt, i) => addFirefly(n, pt, i));
}
