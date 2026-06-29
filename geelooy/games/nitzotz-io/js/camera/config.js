// B"H

/**
 * B"H
 * The camera is a shliach of clarity: high enough to see, near enough to care.
 */
const PRESETS = {
  low: { min: 560, base: 680, max: 1040, height: 430, grow: 4.3, lift: 2.5, lerp: 3.2, clearance: 165 },
  medium: { min: 600, base: 740, max: 1160, height: 470, grow: 4.8, lift: 2.8, lerp: 3.0, clearance: 185 },
  high: { min: 660, base: 820, max: 1320, height: 520, grow: 5.2, lift: 3.0, lerp: 2.8, clearance: 210 }
};

export function cameraConfig(perf = 'medium') {
  return PRESETS[perf] || PRESETS.medium;
}
