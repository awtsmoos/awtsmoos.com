// B"H
/**
 * @file houseJars.js
 * @description Chapter 338: Clay jars add weight near the doorway.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addHouseJars(n, prop, front, sign) {
  for (let i = 0; i < 3; i += 1) box(n, `${prop.id}_jar_${i}`, 'Clay jar', p(prop.center.x + 8 + i * 0.7, 0.45, front + sign), [0.45, 0.9, 0.45], '#9a5f32', false);
}
