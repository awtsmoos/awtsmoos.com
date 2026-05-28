// B"H
/**
 * Compact helpers for hand-authored, validator-friendly level data.
 *
 * The Awtsmoos speaks worlds into form through letters; these tiny builders do
 * the same for Sulam HaSod chambers. Each plain object is a rung, each rung a
 * deliberate betrayal, never random clutter and never an omitted secret.
 */
export const P = (x, y, w, h) => ({ x, y, w, h });
export const C = (x, y, kind = 'perutah') => ({ x, y, kind });
export const F = (x, y, kind = 'dinar', message = 'The coin was a spike wearing gold.') => ({ x, y, kind, message });
export const S = (x, y, w = 70, h = 24, delay = 1, min = 1, max = 3) => ({ x, y, w, h, delay, min, max });
export const E = (x, y, min, max, vx, type = 'husk', name = 'husk', extra = {}) => ({ x, y, w: 36, h: 34, min, max, vx, type, name, ...extra });
export const R = (x, y, w = 76, h = 14, spin = 2, throwPower = 320) => ({ x, y, w, h, spin, throw: throwPower });
export const T = (x, y, w = 70, h = 16, kind = 'shatter', extra = {}) => ({ x, y, w, h, kind, ...extra });
export const G = (x, y, w, h, message, extra = {}) => ({ x, y, w, h, message, ...extra });

/**
 * Builds a complete level object while preserving every optional deception list.
 *
 * The final extra object can include fakeCoins, trickCoins, and future authored
 * lists. This is how the ladder accepts new cruelty without generator magic.
 */
export const L = (name, width, spawn, door, law, platforms, rotatingPlatforms, trickPlatforms, coins, keys, spikes, enemies, triggers, lore = [], extra = {}) => ({
  name,
  width,
  spawn,
  door,
  law,
  platforms,
  rotatingPlatforms,
  trickPlatforms,
  coins,
  keys,
  spikes,
  enemies,
  triggers,
  lore,
  fakeCoins: extra.fakeCoins || [],
  trickCoins: extra.trickCoins || []
});
