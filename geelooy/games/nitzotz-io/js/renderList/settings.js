// B"H

/**
 * B"H
 * The city may contain multitudes, yet the eye receives a measured procession.
 * The Awtsmoos hides no beauty; it only spaces each spark so the browser can
 * keep chanting at speed while the world remains legible.
 */
const PRESETS = {
  low: { maxObjects: 60, drawDistance: 980, cameraCut: 210 },
  medium: { maxObjects: 132, drawDistance: 1340, cameraCut: 250 },
  high: { maxObjects: 162, drawDistance: 1640, cameraCut: 300 }
};

export function renderSettings(perf = 'medium', quality = 1) {
  const p = PRESETS[perf] || PRESETS.medium;
  const q = Math.max(0.42, Math.min(1, quality));
  return { maxObjects: Math.max(44, Math.floor(p.maxObjects * q)), drawDistance: p.drawDistance * (0.68 + q * 0.32), cameraCut: p.cameraCut };
}
