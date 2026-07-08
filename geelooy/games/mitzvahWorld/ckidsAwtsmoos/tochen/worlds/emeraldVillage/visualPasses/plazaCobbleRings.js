// B"H
/**
 * @file plazaCobbleRings.js
 * @description Chapter 295: Cobble rings make the square feel placed by hands,
 * not spawned by a rectangle.
 */
import { box, p, ringPoints } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { P } from './palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function addRing(n, prefix, ring, center) {
  ringPoints(ring.count, ring.radius, center.x, center.z).forEach((stone, i) => {
    box(n, `${prefix}_${i}`, `${prefix} stone`, p(stone.x, ring.y, stone.z), ring.size, i % 2 ? P.stone : P.stone2, true);
  });
}
export function addPlazaCobbleRings(n, config) {
  addRing(n, 'plaza_outer_cobble', config.outer, config.center);
  addRing(n, 'plaza_inner_cobble', config.inner, config.center);
}
