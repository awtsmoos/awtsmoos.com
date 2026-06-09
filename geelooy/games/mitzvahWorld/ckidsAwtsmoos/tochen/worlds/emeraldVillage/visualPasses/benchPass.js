// B"H
/**
 * @file benchPass.js
 * @description Chapter 325: Benches are fixed seats plus a plaza ring, each
 * delegated to smaller files.
 */
import { FIXED_BENCHES, PLAZA_BENCH_RING } from './benchConfig.js';
import { addBenchGeometry } from './benchGeometry.js';
import { addBenchRing } from './benchRing.js';
export function addBenches(n) {
  FIXED_BENCHES.forEach(bench => addBenchGeometry(n, bench));
  addBenchRing(n, PLAZA_BENCH_RING);
}
