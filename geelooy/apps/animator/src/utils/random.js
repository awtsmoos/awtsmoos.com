// B"H
/**
 * @file random.js
 * @description
 * THE SEED OF DETERMINISM (Zera HaNivda).
 * B"H - A pure deterministic seeded random function.
 * No true randomness exists in the Awtsmoos — only the appearance of it,
 * sustained by the mathematical speech of the Creator.
 *
 * THE POEM OF THE SEED:
 * You give me a number, I give you the same,
 * A pseudo-random value, always exactly the same!
 * The sin of the seed times the vast golden prime,
 * Returns a fraction unique, every single time.
 *
 * @param {number} seed - The deterministic seed value.
 * @returns {number} A pseudo-random float in [0, 1).
 */
export function seededRandom(seed) {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}