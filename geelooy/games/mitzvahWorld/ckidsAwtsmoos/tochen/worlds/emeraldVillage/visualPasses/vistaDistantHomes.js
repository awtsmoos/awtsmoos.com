// B"H
/**
 * @file vistaDistantHomes.js
 * @description Chapter 307: Tiny far houses imply the world continues beyond
 * the loaded streets.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addVistaDistantHomes(n, config) {
  for (let i = 0; i < config.distantHomeCount; i += 1) box(n, `distant_village_home_${i}`, 'Distant village home silhouette', p(-130 + i * 28, 7, config.baseZ + 62 + (i % 2) * 8), [10, 12, 6], i % 2 ? '#7a5a38' : '#8a6b42', false);
}
