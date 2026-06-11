// B"H
/**
 * @file WeaponRegistry.js
 * @description
 * Chapter 705: The armory speaks in stable letters.
 *
 * The Awtsmoos forms every projectile through authored data: weapon id, label,
 * damage, cadence, range, and the exact Hebrew letter emitted. Unicode escapes
 * keep the Alef-Beis pure across Windows shells, workers, and browser caches.
 */

export const HEBREW_LETTERS = Object.freeze([
  "\u05d0", "\u05d1", "\u05d2", "\u05d3", "\u05d4", "\u05d5", "\u05d6", "\u05d7", "\u05d8", "\u05d9", "\u05db",
  "\u05dc", "\u05de", "\u05e0", "\u05e1", "\u05e2", "\u05e4", "\u05e6", "\u05e7", "\u05e8", "\u05e9", "\u05ea"
]);

export const WEAPON_REGISTRY = Object.freeze({
  cherev_hakodesh: {
    id: "cherev_hakodesh",
    name: "Cherev HaKodesh",
    icon: "ATK",
    type: "melee",
    damage: 25,
    range: 18,
    attackSpeed: 0.42,
    price: 0,
    projectile: { letter: "\u05d0", color: 0xffd700, speed: 34, lifetime: 0.62, size: 0.72, burst: 3, spread: 0.24 },
    description: "A quick Alef burst for close village defense."
  },
  keshes_haemes: {
    id: "keshes_haemes",
    name: "Keshes HaEmes",
    icon: "BOW",
    type: "ranged",
    damage: 20,
    range: 58,
    attackSpeed: 0.72,
    price: 0,
    projectile: { letter: "\u05e9", color: 0xff5b2d, speed: 66, lifetime: 2.1, size: 0.54, burst: 1, spread: 0 },
    description: "A Shin arrow for clean ranged pulls."
  },
  mateh_hatorah: {
    id: "mateh_hatorah",
    name: "Mateh HaTorah",
    icon: "22",
    type: "magic",
    damage: 18,
    range: 26,
    attackSpeed: 1.55,
    price: 0,
    projectile: { letter: "ALL", color: 0xffffff, speed: 25, lifetime: 1.35, size: 0.38, burst: 22, spread: Math.PI * 2 },
    description: "All letters circle outward for crowd control."
  }
});

/**
 * @returns {string} One authored Hebrew letter.
 */
export function getRandomLetter() {
  return HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)];
}

/**
 * @param {number} i Letter index.
 * @returns {string} Deterministic Hebrew letter.
 */
export function getLetterByIndex(i) {
  return HEBREW_LETTERS[i % HEBREW_LETTERS.length];
}
