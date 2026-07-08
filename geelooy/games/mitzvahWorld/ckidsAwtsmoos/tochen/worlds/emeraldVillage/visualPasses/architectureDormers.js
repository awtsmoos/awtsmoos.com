// B"H
/**
 * @file architectureDormers.js
 * @description Chapter 291: Dormers push simple roofs toward fantasy village
 * silhouettes.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addArchitectureDormer(n, prop) {
  box(n, `${prop.id}_dormer`, 'Little dormer', p(prop.center.x - 2, 5.8, prop.center.z), [1.8, 1.4, 1.4], '#d9cfba', true);
}
