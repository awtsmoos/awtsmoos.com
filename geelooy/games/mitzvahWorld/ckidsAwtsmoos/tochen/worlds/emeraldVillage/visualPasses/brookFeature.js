// B"H
/**
 * @file brookFeature.js
 * @description Chapter 301: A shallow brook line suggests animated water later,
 * but already gives the village a flowing edge.
 */
import { box, p } from './shapeKit.js';
export function addBrookFeature(n, config) {
  config.brook.points.slice(0, -1).forEach((pt, i) => {
    const next = config.brook.points[i + 1];
    const x = (pt[0] + next[0]) / 2, z = (pt[1] + next[1]) / 2;
    const len = Math.hypot(next[0] - pt[0], next[1] - pt[1]);
    box(n, `${config.brook.id}_${i}`, 'Entry brook water ribbon', p(x, 0.12, z), [len, 0.06, 1.15], '#47b6d9', false);
    box(n, `${config.brook.id}_bank_${i}`, 'Entry brook stone bank', p(x, 0.18, z + 0.9), [len, 0.14, 0.35], '#7f7a6b', false);
  });
}
