// B"H
/**
 * @file vistaMountains.js
 * @description Chapter 304: Mountains give the image a back wall and the
 * village a mythic container.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addVistaMountains(n, config) {
  for (let i = 0; i < config.mountainCount; i += 1) box(n, `distant_mountain_${i}`, 'Distant mountain silhouette', p(-240 + i * 60, 45, config.baseZ - i % 3 * 20), [80, 90 + i * 8, 18], '#53656a', false);
}
