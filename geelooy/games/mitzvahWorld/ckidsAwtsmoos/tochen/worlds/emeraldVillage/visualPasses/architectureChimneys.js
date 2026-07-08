// B"H
/**
 * @file architectureChimneys.js
 * @description Chapter 289: Chimneys tell the eye that families live inside.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addArchitectureChimney(n, prop) {
  box(n, `${prop.id}_chimney`, 'Stone chimney', p(prop.center.x + 4, 6, prop.center.z + 1), [0.8, 2.4, 0.8], '#75685d', true);
}
