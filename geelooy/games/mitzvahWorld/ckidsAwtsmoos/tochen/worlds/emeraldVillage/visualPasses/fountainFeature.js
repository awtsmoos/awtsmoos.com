// B"H
/**
 * @file fountainFeature.js
 * @description Chapter 300: The fountain gives the plaza a second focal sound,
 * even before audio exists.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { P } from './palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addFountainFeature(n, config) {
  const { x, z } = config.fountain;
  box(n, 'entry_fountain_basin', 'Low fountain basin', p(x, 0.35, z), [5.2, 0.7, 5.2], P.stone, true);
  box(n, 'entry_fountain_water', 'Fountain water sheet', p(x, 0.78, z), [4, 0.08, 4], P.water, false);
  box(n, 'entry_fountain_spark', 'Fountain sparkle', p(x, 1.75, z), [0.52, 1.8, 0.52], '#9fe9ff', false);
}
