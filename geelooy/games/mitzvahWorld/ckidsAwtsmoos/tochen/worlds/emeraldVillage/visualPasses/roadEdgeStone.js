// B"H
/**
 * @file roadEdgeStone.js
 * @description Chapter 315: A single cobble on a single side of a single road
 * segment, humble and exact.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addRoadEdgeStone(n, road, key, side, cx, cz, frame, config) {
  box(n, `${key}_${side}`, 'Road edge stone', p(cx + frame.nx * side * (road.width * config.offsetRatio), 0.13, cz + frame.nz * side * (road.width * config.offsetRatio)), [0.75, 0.24, 0.55], side > 0 ? '#756d61' : '#8b8275', true);
}
