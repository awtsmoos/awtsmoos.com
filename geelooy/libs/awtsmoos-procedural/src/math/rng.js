/**
 * B"H
 * @chapter A tiny seed stood before the Awtsmoos and became a forest of numbers.
 * No framework enters here; only deterministic breath, renewed each instant.
 */
export function hashSeed(value = 'awtsmoos') {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createRng(seed = 'awtsmoos') {
  let state = hashSeed(seed) || 1;
  return function rng() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) / 4294967296);
  };
}

export function range(rng, min, max) {
  return min + (max - min) * rng();
}
