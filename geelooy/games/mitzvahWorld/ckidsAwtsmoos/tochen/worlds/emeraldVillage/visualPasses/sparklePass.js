// B"H
/**
 * @file sparklePass.js
 * @description Chapter 483: Firefly count now scales, keeping wonder while
 * cutting tiny draw calls on old phones.
 */
import { ringPoints } from './shapeKit.js';
import { SPARKLE_RING } from './sparkleConfig.js';
import { addFirefly } from './sparkleFirefly.js';
import { scaledCount } from './visualDensityConfig.js';
export function addSparkles(n, density = {}) {
  const count = scaledCount(SPARKLE_RING.count, density.sparkleScale ?? 1, 12);
  ringPoints(count, SPARKLE_RING.radius, SPARKLE_RING.x, SPARKLE_RING.z).forEach((pt, i) => addFirefly(n, pt, i));
}
