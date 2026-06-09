// B"H
/**
 * @file roadSegmentMath.js
 * @description Chapter 314: The Awtsmoos turns two road points into length,
 * normal, and measured edge steps.
 */
export function segmentFrame(pt, next, config) {
  const dx = next[0] - pt[0], dz = next[1] - pt[1], len = Math.hypot(dx, dz) || 1;
  return { dx, dz, len, nx: -dz / len, nz: dx / len, steps: Math.min(config.maxSteps, Math.max(config.minSteps, Math.floor(len / config.stepDivisor))) };
}
