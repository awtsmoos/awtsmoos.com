// B"H
/** @file roads.js @description Chapter 355: Roads are generated once and named. */
import { ROAD_NETWORK } from '../roadNetwork.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addRoads(n, properties) {
  ROAD_NETWORK.generate(properties).forEach(road => { n.ProceduralRoad[road.id] = { ...road, material: road.material || 'dirt' }; });
}
