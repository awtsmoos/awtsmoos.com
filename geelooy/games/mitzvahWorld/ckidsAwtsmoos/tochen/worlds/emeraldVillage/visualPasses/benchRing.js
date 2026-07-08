// B"H
/**
 * @file benchRing.js
 * @description Chapter 324: A ring of benches teaches the eye that the plaza
 * is a gathering place.
 */
import { ringPoints } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addBenchGeometry } from './benchGeometry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addBenchRing(n, ring) {
  ringPoints(ring.count, ring.radius, ring.x, ring.z).forEach((pt, i) => addBenchGeometry(n, { id: `plaza_bench_${i}`, x: pt.x, z: pt.z, rot: i % 2 === 0 }));
}
