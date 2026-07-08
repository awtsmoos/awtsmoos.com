// B"H
/**
 * @file marketLanterns.js
 * @description Chapter 284: Market lanterns pull warm focus toward the stalls.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { P } from './palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addMarketLanterns(n, stalls) {
  stalls.forEach((stall, i) => {
    box(n, `${stall.id}_lantern_left`, 'Market hanging lantern', p(stall.x - 1.55, 2.2, stall.z), [0.28, 0.42, 0.28], P.light, false);
    box(n, `${stall.id}_lantern_right`, 'Market hanging lantern', p(stall.x + 1.55, 2.2, stall.z), [0.28, 0.42, 0.28], P.light, false);
    box(n, `market_path_lantern_${i}`, 'Market path lantern', p(stall.x, 2.6, stall.z + 3.2), [0.34, 0.55, 0.34], P.light, false);
  });
}
