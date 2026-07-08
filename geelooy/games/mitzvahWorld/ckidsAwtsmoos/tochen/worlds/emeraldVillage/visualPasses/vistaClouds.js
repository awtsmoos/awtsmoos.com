// B"H
/**
 * @file vistaClouds.js
 * @description Chapter 306: Slow cloud bars fake atmosphere while the engine
 * remains simple.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addVistaClouds(n, config) {
  for (let i = 0; i < config.cloudCount; i += 1) box(n, `distant_cloud_band_${i}`, 'Distant cloud band', p(-210 + i * 70, 92 + (i % 3) * 7, config.baseZ + 32), [46, 9, 4], '#dbe8e5', false);
}
