// B"H
/**
 * @file benchGeometry.js
 * @description Chapter 323: One bench, two planks, a tiny rest for the player.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { P } from './palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addBenchGeometry(n, bench) {
  box(n, `${bench.id}_seat`, 'Bench seat', p(bench.x, 0.55, bench.z), bench.rot ? [0.42, 0.18, 2.5] : [2.5, 0.18, 0.42], P.wood, true);
  box(n, `${bench.id}_back`, 'Bench back', p(bench.x, 0.95, bench.z), bench.rot ? [0.18, 0.55, 2.5] : [2.5, 0.55, 0.18], P.darkWood, true);
}
