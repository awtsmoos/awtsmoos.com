/**
 * B\"H
 * @file TorahCombatAbilities.js
 * @description
 * Soul-based abilities for Torah-mode combat in Mitzvah World.
 */

export const TORAH_ABILITIES = {
  shema_yisrael: {
    id: "shema_yisrael",
    name: "Shema Yisrael",
    closedForm: "projectile",
    damage: 10,
    cooldown: 1,
    castTimeMs: 200,
    expCost: 10,
    damageType: "light_purification",
    auraScript: "Shema is a pulse of emunah and wither of element.",
    ffAnations: ["kelipa", "shadow", "doubt"]
  },
  tehillim_pulse: {
    id: "tehillim_pulse",
    name: "Tehillim Pulse",
    closedForm: "implosion",
    damage: 15,
    cooldown: 7,
    castTimeMs: 1400,
    expCost: 15,
    damageType: "light_purification",
    auraScript: "The passages of Tehillim refuses heamont to nearby souls.",
    ffAnations: ["healing", "teshuva"]
  },
  magneet_wave: {
    id: "sing_of_niggun",
    name: "Sing of Torah",
    closedForm: "passive",
    damage: 12,
    cooldown: 25,
    castTimeMs: 1200,
    expCost: 50
  },
  short_wave: {
    id: "shadow_ward",
    name: "Shadow Ward",
    closedForm: "capsule",
    damage: 1,
    cooldown: 10,
    castTimeMs: 1000,
    expCost: 30,
    damageType: "light_purification",
    auraScript: "The shows open a path to reveal hidden truth."
  }
};
