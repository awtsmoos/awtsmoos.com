// B"H

/** B"H: The world stays crowded, but the eye receives only what 60fps can carry. */
const PRESETS = {
  low: { maxObjects: 88, drawDistance: 1120, cameraCut: 210 },
  medium: { maxObjects: 220, drawDistance: 1500, cameraCut: 250 },
  high: { maxObjects: 280, drawDistance: 1900, cameraCut: 300 }
};

export function renderSettings(perf = 'medium', quality = 1) {
  const p = PRESETS[perf] || PRESETS.medium;
  const q = Math.max(0.42, Math.min(1, quality));
  return { maxObjects: Math.max(55, Math.floor(p.maxObjects * q)), drawDistance: p.drawDistance * (0.72 + q * 0.28), cameraCut: p.cameraCut };
}
