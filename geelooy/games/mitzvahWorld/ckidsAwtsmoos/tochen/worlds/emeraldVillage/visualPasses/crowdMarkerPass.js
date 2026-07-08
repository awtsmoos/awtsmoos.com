// B"H
/**
 * @file crowdMarkerPass.js
 * @description Chapter 482: Ambient crowd markers scale down on weaker devices,
 * keeping the village alive without filling the GPU with silhouettes.
 */
import { CROWD_MARKERS } from './crowdConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addCrowdSilhouette } from './crowdSilhouette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { scaledCount } from './visualDensityConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addCrowdMarkers(n, density = {}) {
  CROWD_MARKERS.slice(0, scaledCount(CROWD_MARKERS.length, density.crowdScale ?? 1, 6)).forEach(marker => addCrowdSilhouette(n, marker));
}
