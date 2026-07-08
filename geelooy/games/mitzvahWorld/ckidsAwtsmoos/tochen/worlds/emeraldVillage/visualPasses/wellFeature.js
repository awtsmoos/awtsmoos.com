// B"H
/**
 * @file wellFeature.js
 * @description Chapter 299: The well becomes a small story object near the
 * beginning, heavy with stone and dark water.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { P } from './palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addWellFeature(n, config) {
  const { x, z } = config.well;
  box(n, 'entry_well_base', 'Stone village well', p(x, 0.55, z), [3.8, 1.1, 3.8], P.stone, true);
  box(n, 'entry_well_water', 'Dark well water', p(x, 1.14, z), [2.4, 0.08, 2.4], '#1d5b72', false);
  box(n, 'entry_well_roof', 'Small well roof', p(x, 3.05, z), [4.6, 0.32, 3.2], P.wood, true);
}
