// B"H
/** @file ClosestPoints.js @description Stable segment closest-points math from the old Octree covenant. */
import { Vector3 } from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
const _r = new Vector3(), _s = new Vector3(), _w = new Vector3();
const EPS = 1e-10;
export function lineToLineClosestPoints(line1, line2, target1, target2) {
  const r = _r.copy(line1.end).sub(line1.start), s = _s.copy(line2.end).sub(line2.start), w = _w.copy(line2.start).sub(line1.start);
  const a = r.dot(s), b = r.dot(r), c = s.dot(s), d = s.dot(w), e = r.dot(w);
  let t1, t2; const divisor = b * c - a * a;
  if (Math.abs(divisor) < EPS) { const d1 = -d / c, d2 = (a - d) / c; if (Math.abs(d1 - .5) < Math.abs(d2 - .5)) { t1 = 0; t2 = d1; } else { t1 = 1; t2 = d2; } }
  else { t1 = (d * a + e * c) / divisor; t2 = (t1 * a - d) / c; }
  t2 = Math.max(0, Math.min(1, t2)); t1 = Math.max(0, Math.min(1, t1));
  target1?.copy(r).multiplyScalar(t1).add(line1.start); target2?.copy(s).multiplyScalar(t2).add(line2.start);
}
