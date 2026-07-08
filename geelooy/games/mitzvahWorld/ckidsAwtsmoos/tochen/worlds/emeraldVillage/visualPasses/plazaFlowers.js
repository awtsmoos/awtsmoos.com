// B"H
/**
 * @file plazaFlowers.js
 * @description Chapter 296: Flowers soften the stone threshold and pull the
 * village toward the reference image's garden edges.
 */
import { flower } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addPlazaFlowers(n, config) {
  flower(n, config.flowers.id, config.flowers.x, config.flowers.z, config.flowers.radius, config.flowers.count, 'daisy');
}
