// B"H
/**
 * @file roadEdgeSegment.js
 * @description Chapter 316: A road segment receives left and right cobbles,
 * the visible grammar of a path.
 */
import { addRoadEdgeStone } from './roadEdgeStone.js';
import { segmentFrame } from './roadSegmentMath.js';
export function decorateRoadSegment(n, road, ri, pi, pt, next, config) {
  const frame = segmentFrame(pt, next, config);
  for (let s = 0; s < frame.steps; s += 1) {
    const t = (s + 0.5) / frame.steps, cx = pt[0] + frame.dx * t, cz = pt[1] + frame.dz * t, key = `road_${ri}_${pi}_edge_${s}`;
    addRoadEdgeStone(n, road, key, -1, cx, cz, frame, config);
    addRoadEdgeStone(n, road, key, 1, cx, cz, frame, config);
  }
}
