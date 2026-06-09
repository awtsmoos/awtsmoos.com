// B"H
/**
 * @file crowdMarkerPass.js
 * @description Chapter 482: Ambient crowd markers scale down on weaker devices,
 * keeping the village alive without filling the GPU with silhouettes.
 */
import { CROWD_MARKERS } from './crowdConfig.js';
import { addCrowdSilhouette } from './crowdSilhouette.js';
import { scaledCount } from './visualDensityConfig.js';
export function addCrowdMarkers(n, density = {}) {
  CROWD_MARKERS.slice(0, scaledCount(CROWD_MARKERS.length, density.crowdScale ?? 1, 6)).forEach(marker => addCrowdSilhouette(n, marker));
}
