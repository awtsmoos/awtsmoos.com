// B"H
/**
 * @file roadEdgePass.js
 * @description Chapter 478: Road-edge cobbles now scale by density; weak
 * devices receive fewer decorated roads.
 */
import { ROAD_EDGE_CONFIG } from './roadEdgeConfig.js';
import { decorateRoadSegment } from './roadEdgeSegment.js';
import { scaledCount } from './visualDensityConfig.js';
export function addRoadEdges(n, roads, density = {}) {
  const maxRoads = scaledCount(ROAD_EDGE_CONFIG.maxRoads, density.roadScale ?? 1, 5);
  roads.slice(0, maxRoads).forEach((road, ri) => (road.points || []).slice(0, -1).forEach((pt, pi) => decorateRoadSegment(n, road, ri, pi, pt, road.points[pi + 1], ROAD_EDGE_CONFIG)));
}
