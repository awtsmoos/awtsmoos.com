// B"H
/**
 * @file marketStallFrame.js
 * @description Chapter 281: Tables and awnings give the market its readable
 * silhouette.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { P } from './palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addMarketStallFrame(n, stall) {
  box(n, `${stall.id}_table`, `${stall.id} Table`, p(stall.x, 0.7, stall.z), [3.2, 0.28, 1.55], P.wood, true);
  box(n, `${stall.id}_cloth`, `${stall.id} Cloth`, p(stall.x, 1.75, stall.z), [3.7, 0.16, 1.9], stall.color, false);
  box(n, `${stall.id}_back_pole`, `${stall.id} Back Pole`, p(stall.x, 1.5, stall.z - 0.85), [0.18, 2.4, 0.18], P.darkWood, true);
}
