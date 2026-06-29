// B"H

/** B"H: Density is mercy; too many vessels conceal the road. */
const PRESETS = {
  low: { maxObjects: 80, drawDistance: 900, cameraCut: 190 },
  medium: { maxObjects: 140, drawDistance: 1180, cameraCut: 230 },
  high: { maxObjects: 220, drawDistance: 1520, cameraCut: 260 }
};

export function renderSettings(perf = 'medium') {
  return PRESETS[perf] || PRESETS.medium;
}
