// B"H

/**
 * B"H
 * The city may contain multitudes, yet the eye receives a measured procession.
 * These caps keep the revealed world readable before the adaptive governor even
 * begins to shed quality under stress.
 */
const PRESETS = {
  low: { maxObjects: 72, drawDistance: 1040, cameraCut: 210 },
  medium: { maxObjects: 160, drawDistance: 1420, cameraCut: 250 },
  high: { maxObjects: 190, drawDistance: 1740, cameraCut: 300 }
};

export function renderSettings(perf = 'medium', quality = 1) {
  const p = PRESETS[perf] || PRESETS.medium;
  const q = Math.max(0.42, Math.min(1, quality));
  return { maxObjects: Math.max(48, Math.floor(p.maxObjects * q)), drawDistance: p.drawDistance * (0.7 + q * 0.3), cameraCut: p.cameraCut };
}
