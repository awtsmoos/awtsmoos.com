// B"H
/**
 * @file marketProduce.js
 * @description Chapter 480: Produce count scales with density while preserving
 * color and readable abundance.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { scaledCount } from './visualDensityConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
const PRODUCE = ['#b83b27', '#d8a938', '#4d9a3f', '#8a45a8', '#e86b2d'];
export function addMarketProduce(n, stall, density = {}) {
  const count = scaledCount(8, density.marketScale ?? 1, 3);
  for (let i = 0; i < count; i += 1) box(n, `${stall.id}_produce_${i}`, 'Market produce', p(stall.x - 1.35 + i * 0.38, 1, stall.z + 0.2 * (i % 2)), [0.34, 0.28, 0.34], PRODUCE[i % PRODUCE.length], false);
}
