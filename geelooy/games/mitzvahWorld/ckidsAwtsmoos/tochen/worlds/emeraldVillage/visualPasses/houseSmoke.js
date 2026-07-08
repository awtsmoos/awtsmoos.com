// B"H
/**
 * @file houseSmoke.js
 * @description Chapter 336: Smoke makes the home warm even without animation.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { P } from './palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addHouseSmoke(n, prop) {
  box(n, `${prop.id}_smoke_a`, 'Chimney smoke', p(prop.center.x + 4.8, 8.4, prop.center.z + 2.2), [0.72, 0.55, 0.72], P.smoke, false);
}
