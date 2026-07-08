// B"H
/**
 * @file architecturePorches.js
 * @description Chapter 290: Porches pull houses into the road network, like
 * hands reaching from homes into village life.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { P } from './palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addArchitecturePorch(n, prop) {
  box(n, `${prop.id}_porch`, 'Wooden porch', p(prop.center.x, 0.3, prop.center.z - 8), [5.5, 0.6, 2.5], P.wood, true);
}
