// B"H
/**
 * @file objectiveMarkerPass.js
 * @description Chapter 311: The first objective chain appears as glowing floor
 * breadcrumbs from spawn to the level guide.
 */
import { box, p } from './shapeKit.js';
import { OBJECTIVE_MARKERS } from './objectiveMarkerConfig.js';
export function addObjectiveMarkers(n) {
  OBJECTIVE_MARKERS.forEach((marker, i) => {
    box(n, marker.id, `Entry objective marker ${i + 1}`, p(marker.x, 0.28, marker.z), [1.4, 0.16, 1.4], marker.color, false);
  });
}
