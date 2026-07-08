// B"H
/**
 * @file benchPass.js
 * @description Chapter 325: Benches are fixed seats plus a plaza ring, each
 * delegated to smaller files.
 */
import { FIXED_BENCHES, PLAZA_BENCH_RING } from './benchConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addBenchGeometry } from './benchGeometry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addBenchRing } from './benchRing.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addBenches(n) {
  FIXED_BENCHES.forEach(bench => addBenchGeometry(n, bench));
  addBenchRing(n, PLAZA_BENCH_RING);
}
