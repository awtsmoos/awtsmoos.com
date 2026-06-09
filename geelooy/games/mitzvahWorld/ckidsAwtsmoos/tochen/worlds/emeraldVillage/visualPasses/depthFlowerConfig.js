// B"H
/**
 * @file depthFlowerConfig.js
 * @description Chapter 340: Far flower banks become a manifest of soft color
 * around the playable square.
 */
export const DEPTH_FLOWERS = Object.freeze(Array.from({ length: 20 }, (_, i) => Object.freeze({
  id: `depth_flower_bank_${i}`,
  x: Math.sin(i * 2.1) * 76,
  z: Math.cos(i * 1.7) * 76,
  radius: 5 + i % 4,
  count: 100 + i * 8,
  type: i % 2 ? 'rose' : 'daisy'
})));
