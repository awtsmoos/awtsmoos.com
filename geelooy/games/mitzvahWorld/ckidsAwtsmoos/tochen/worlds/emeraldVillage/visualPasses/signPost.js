// B"H
/**
 * @file signPost.js
 * @description Chapter 319: The post roots the sign into the ground.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { P } from './palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addSignPost(n, sign) {
  box(n, `${sign.id}_post`, `${sign.name} Post`, p(sign.x, 0.9, sign.z), [0.18, 1.8, 0.18], P.darkWood, true);
}
