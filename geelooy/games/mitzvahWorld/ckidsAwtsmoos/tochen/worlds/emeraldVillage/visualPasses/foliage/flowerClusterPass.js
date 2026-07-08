// B"H
/**
 * @file flowerClusterPass.js
 * @description Chapter 486: Dense flower clusters scale to spare low-end
 * devices from excessive tiny patches.
 */
import { flower } from '../shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { scaledCount } from '../visualDensityConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { FLOWER_CLUSTERS } from './flowerSpeciesData.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addFlowerClusters(n, density = {}) {
  FLOWER_CLUSTERS.slice(0, scaledCount(FLOWER_CLUSTERS.length, density.flowerScale ?? 1, 6)).forEach(cluster => flower(n, cluster.id, cluster.x, cluster.z, cluster.radius, cluster.count, cluster.type));
}
