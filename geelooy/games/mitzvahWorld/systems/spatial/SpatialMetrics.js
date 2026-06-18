// B"H
/**
 * @file SpatialMetrics.js
 * @description Chapter 450: the hidden cost becomes visible. The Awtsmoos asks
 * each query to leave a footprint, so performance stops being rumor.
 */
export class SpatialMetrics {
  constructor() { this.reset(); }
  reset() {
    this.staticCapsuleQueries = 0;
    this.staticRayQueries = 0;
    this.dynamicQueries = 0;
    this.dynamicCandidates = 0;
    this.dynamicHits = 0;
    this.activeFull = 0;
    this.activeSlow = 0;
    this.activeIdle = 0;
    this.activeSleep = 0;
  }
  add(name, amount = 1) { this[name] = (this[name] || 0) + amount; return this[name]; }
  snapshot() { return { ...this }; }
}
export function ensureSpatialMetrics(host = globalThis) {
  if (!host.__AWTSMOOS_SPATIAL_METRICS__) host.__AWTSMOOS_SPATIAL_METRICS__ = new SpatialMetrics();
  return host.__AWTSMOOS_SPATIAL_METRICS__;
}
export default SpatialMetrics;
