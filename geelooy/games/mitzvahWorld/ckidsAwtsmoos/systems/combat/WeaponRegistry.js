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
    name: "Cherev HaKodesh",
    icon: "SWD",
    type: "melee",
    damage: 22,
    range: 7.5,
    attackSpeed: 0.44,
    koachCost: 2,
    price: 0,
    arc: 105,
    windupMs: 130,
    recoverMs: 260,
    interruptible: true,
    impact: "close-cut",
    sound: "sword-soft",
    description: "A close sword arc for selected targets."
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
  },
  fists: {
    id: "fists",
    name: "Fists",
    icon: "FST",
    type: "melee",
    damage: 8,
    range: 3.6,
    attackSpeed: 0.32,
    koachCost: 0,
    arc: 70,
    windupMs: 80,
    recoverMs: 170,
    interruptible: true,
    impact: "punch",
    sound: "hand-hit",
    description: "Fast unarmed strikes for close range."
  },
  axe: {
    id: "axe",
    name: "Wood Axe",
    icon: "AXE",
    type: "melee",
    damage: 30,
    range: 6.8,
    attackSpeed: 0.82,
    koachCost: 6,
    arc: 82,
    windupMs: 240,
    recoverMs: 420,
    interruptible: false,
    impact: "heavy-chop",
    sound: "axe-hit",
    description: "Slow heavy melee with a strong stagger profile."
  },
  club: {
    id: "club",
    name: "Training Club",
    icon: "CLB",
    type: "melee",
    damage: 18,
    range: 5.8,
    attackSpeed: 0.58,
    koachCost: 3,
    arc: 95,
    windupMs: 170,
    recoverMs: 330,
    interruptible: true,
    impact: "blunt",
    sound: "club-hit",
    description: "Reliable blunt melee for village training."
  },
  slingshot: {
    id: "slingshot",
    name: "Slingshot",
    icon: "SLG",
    type: "ranged",
    damage: 12,
    range: 42,
    attackSpeed: 0.48,
    koachCost: 2,
    projectile: { letter: "\u05d9", color: 0xe8d3a0, speed: 54, lifetime: 1.35, size: 0.36, burst: 1, spread: 0.02 },
    windupMs: 120,
    recoverMs: 220,
    interruptible: true,
    impact: "pebble",
    sound: "sling-release",
    description: "Cheap ranged harassment."
  },
  thrown_spear: {
    id: "thrown_spear",
    name: "Thrown Spear",
    icon: "SPR",
    type: "ranged",
    damage: 34,
    range: 50,
    attackSpeed: 1.05,
    koachCost: 8,
    projectile: { letter: "\u05d5", color: 0xbfe8ff, speed: 72, lifetime: 1.25, size: 0.5, burst: 1, spread: 0 },
    windupMs: 310,
    recoverMs: 520,
    interruptible: false,
    impact: "pierce",
    sound: "spear-throw",
    description: "Committed ranged opener with high single-hit damage."
  }
});

export function getRandomLetter() {
  return HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)];
}

export function getLetterByIndex(i) {
  return HEBREW_LETTERS[i % HEBREW_LETTERS.length];
}
