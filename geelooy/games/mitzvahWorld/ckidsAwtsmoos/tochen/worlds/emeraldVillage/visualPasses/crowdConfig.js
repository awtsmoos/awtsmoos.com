// B"H
/**
 * @file crowdConfig.js
 * @description Chapter 326: Ambient crowd silhouettes become a small manifest,
 * the first hint of future NPC schedules.
 */
export const CROWD_MARKERS = Object.freeze(Array.from({ length: 28 }, (_, i) => Object.freeze({
  id: `ambient_crowd_marker_${i}`,
  x: -18 + (i % 14) * 2.8,
  z: 10 + Math.floor(i / 14) * 4,
  color: ['#1b1b1b', '#ffffff', '#2f5f9f', '#8c3329'][i % 4]
})));
