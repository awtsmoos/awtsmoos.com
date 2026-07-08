// B"H
/**
 * @file houseLaundry.js
 * @description Chapter 337: Laundry lines are quiet proof that people live
 * here, not just meshes.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { P } from './palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addHouseLaundry(n, prop, index, front, sign) {
  for (let i = 0; i < 4; i += 1) box(n, `${prop.id}_laundry_${i}`, 'Hanging laundry', p(prop.center.x - 4.5 + i * 3, 1.85, front + sign * 2.4), [1.05, 0.85, 0.08], [P.linen, P.blue, P.red, P.green][(i + index) % 4], false);
}
