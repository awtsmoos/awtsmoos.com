// B"H
/**
 * @file crowdSilhouette.js
 * @description Chapter 327: A single ambient body shape, waiting for a future
 * animation schedule.
 */
import { box, p } from './shapeKit.js';
export function addCrowdSilhouette(n, marker) {
  box(n, marker.id, 'Ambient villager silhouette', p(marker.x, 0.95, marker.z), [0.38, 1.9, 0.38], marker.color, false);
}
