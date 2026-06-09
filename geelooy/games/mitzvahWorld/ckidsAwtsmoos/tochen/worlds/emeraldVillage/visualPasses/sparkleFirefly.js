// B"H
/**
 * @file sparkleFirefly.js
 * @description Chapter 330: One glowing square of wonder near the tree.
 */
import { box, p } from './shapeKit.js';
export function addFirefly(n, pt, i) {
  box(n, `etz_firefly_${i}`, 'Etz Chayim firefly', p(pt.x, 2.2 + (i % 9) * 0.45, pt.z), [0.16, 0.16, 0.16], i % 2 ? '#fff2a8' : '#9fe9ff', false);
}
