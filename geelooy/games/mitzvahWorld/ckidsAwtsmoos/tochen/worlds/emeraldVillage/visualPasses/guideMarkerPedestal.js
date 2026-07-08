// B"H
/**
 * @file guideMarkerPedestal.js
 * @description Chapter 258: A golden base declares that this NPC is not random;
 * it is the gateway to the lava ladder.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { P } from './palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addGuidePedestal(n, config) {
  const c = config.center;
  box(n, config.pedestal.id, config.pedestal.name, p(c.x, 0.18, c.z), config.pedestal.size, P.gold, true);
  box(n, config.halo.id, config.halo.name, p(c.x, 2.65, c.z), config.halo.size, P.light, false);
}
