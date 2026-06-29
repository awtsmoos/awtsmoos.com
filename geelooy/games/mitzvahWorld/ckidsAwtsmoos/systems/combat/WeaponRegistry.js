// B"H
/**
 * @file WeaponRegistry.js
 * @description
 * Chapter 706: The armory must be seen. Even the basic ATK now fires a visible
 * Alef-burst so every strike has Hebrew-letter feedback before refinement lands.
 */
export const HEBREW_LETTERS = Object.freeze([
  "\u05d0", "\u05d1", "\u05d2", "\u05d3", "\u05d4", "\u05d5", "\u05d6", "\u05d7", "\u05d8", "\u05d9", "\u05db",
  "\u05dc", "\u05de", "\u05e0", "\u05e1", "\u05e2", "\u05e4", "\u05e6", "\u05e7", "\u05e8", "\u05e9", "\u05ea"
]);

export const WEAPON_REGISTRY = Object.freeze({
  cherev_hakodesh: {
    id: "cherev_hakodesh",
    name: "Alef Strike",
    icon: "ATK",
    type: "ranged",
    damage: 25,
    range: 34,
    attackSpeed: 0.42,
    koachCost: 3,
    price: 0,
    projectile: {
      letter: "\u05d0",
      color: 0xffd700,
      speed: 48,
      lifetime: 0.9,
      size: 1.05,
      burst: 7,
      spread: 0.34
    },
    description: "A close Alef burst that makes every Strike visible."
  },
  keshes_haemes: {
    id: "keshes_haemes",
    name: "Keshes HaEmes",
    icon: "BOW",
    type: "ranged",
    damage: 20,
    range: 58,
    attackSpeed: 0.72,
    koachCost: 5,
    price: 0,
    projectile: {
      letter: "\u05e9",
      color: 0xff5b2d,
      speed: 66,
      lifetime: 2.1,
      size: 0.54,
      burst: 1,
      spread: 0
    },
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
    koachCost: 12,
    price: 0,
    projectile: {
      letter: "ALL",
      color: 0xffffff,
      speed: 25,
      lifetime: 1.35,
      size: 0.38,
      burst: 22,
      spread: Math.PI * 2
    },
    description: "All letters circle outward for crowd control."
  }
});

export function getRandomLetter() {
  return HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)];
}

export function getLetterByIndex(i) {
  return HEBREW_LETTERS[i % HEBREW_LETTERS.length];
}
