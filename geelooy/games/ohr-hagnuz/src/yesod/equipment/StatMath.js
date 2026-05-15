/**
 * B"H
 * @module StatMath
 * Pure helpers for sefirah stat merges.
 */
export const StatKeys = ['chochmah', 'binah', 'daat', 'maxLight'];

export const emptyStats = () => ({
  chochmah: 0,
  binah: 0,
  daat: 0,
  maxLight: 0
});

export const mergeStats = (...lists) => {
  const out = emptyStats();
  for (const list of lists) {
    for (const key of StatKeys) out[key] += Number(list?.[key] || 0);
  }
  return out;
};

export const clampMod = (value, min, max) => Math.max(min, Math.min(max, value));
