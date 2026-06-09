// B"H
/**
 * @file guideMarkerRing.js
 * @description Chapter 260: Twelve stones around the guide become a ritual UI
 * circle, a compass of touch and attention.
 */
import { box, p, ringPoints } from './shapeKit.js';
import { P } from './palette.js';
export function addGuideRing(n, config) {
  ringPoints(config.ringCount, config.ringRadius, config.center.x, config.center.z).forEach((pt, i) => {
    box(n, `central_level_guide_ring_${i}`, 'Guide floor ring stone', p(pt.x, 0.2, pt.z), [0.65, 0.16, 0.42], i % 2 ? P.stone : P.light, false);
  });
}
