// B"H
/** @file FenceGapMath.js @description Pure math for splitting fence collider bodies around gate openings. */
export function segmentLength(a = {}, b = {}) { return Math.hypot((b.x || 0) - (a.x || 0), (b.z || 0) - (a.z || 0)); }
export function segmentYaw(a = {}, b = {}) { return Math.atan2((b.x || 0) - (a.x || 0), (b.z || 0) - (a.z || 0)); }
export function segmentCenter(a = {}, b = {}) { return { x: ((a.x || 0) + (b.x || 0)) / 2, z: ((a.z || 0) + (b.z || 0)) / 2 }; }
export function splitSegmentForGap(segment = {}) {
  const a = segment.start || { x: 0, z: 0 }, b = segment.end || { x: 0, z: 0 }, gap = segment.gap;
  if (!gap) return [[a, b]];
  const total = segmentLength(a, b), gapWidth = Math.min(total * 0.8, gap.width || 2.4);
  if (total <= 0.05) return [];
  const horizontal = Math.abs((b.x || 0) - (a.x || 0)) >= Math.abs((b.z || 0) - (a.z || 0));
  const axisA = horizontal ? (a.x || 0) : (a.z || 0), axisB = horizontal ? (b.x || 0) : (b.z || 0);
  const centerAxis = gap.centerX ?? gap.centerZ ?? ((axisA + axisB) / 2);
  const t = (centerAxis - axisA) / ((axisB - axisA) || total);
  const halfT = gapWidth / total / 2;
  const t0 = Math.max(0, t - halfT), t1 = Math.min(1, t + halfT);
  const p = q => ({ x: (a.x || 0) + ((b.x || 0) - (a.x || 0)) * q, z: (a.z || 0) + ((b.z || 0) - (a.z || 0)) * q });
  return [[a, p(t0)], [p(t1), b]].filter(pair => segmentLength(pair[0], pair[1]) > 0.05);
}
export default { segmentLength, segmentYaw, segmentCenter, splitSegmentForGap };
