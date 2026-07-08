// B"H
/**
 * @file architectureRoofs.js
 * @description Chapter 288: Roof accents break silhouette repetition with
 * colored trim and a little hand-made rhythm.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { BANNERS } from './palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addArchitectureRoof(n, prop, i) {
  box(n, `${prop.id}_roof_accent`, 'Painted roof accent', p(prop.center.x, 6.8, prop.center.z), [4.5, 0.25, 0.4], BANNERS[(i + 1) % BANNERS.length], false);
}
