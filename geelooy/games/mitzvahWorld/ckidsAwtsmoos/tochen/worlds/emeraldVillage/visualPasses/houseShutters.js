// B"H
/**
 * @file houseShutters.js
 * @description Chapter 334: Shutters add eyes to the wall.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { P } from './palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addHouseShutters(n, prop, front) {
  box(n, `${prop.id}_left_shutter`, 'Left shutter', p(prop.center.x - 3.6, 2.7, front), [0.55, 1.45, 0.16], P.darkWood, false);
  box(n, `${prop.id}_right_shutter`, 'Right shutter', p(prop.center.x + 3.6, 2.7, front), [0.55, 1.45, 0.16], P.darkWood, false);
}
