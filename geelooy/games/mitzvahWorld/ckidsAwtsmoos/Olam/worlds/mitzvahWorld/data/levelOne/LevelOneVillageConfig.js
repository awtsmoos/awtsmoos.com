// B"H
/**
 * LevelOneVillageConfig.js
 * A small map of the first breath: spawn, Rebbe, holy home, and future sky.
 */
export const LEVEL_ONE = Object.freeze({
  spawn: [0, 0, 0],
  rebbe: [-4, 0, -9],
  beisMidrash: [0, 0, -32],
  market: [18, 0, -18],
  homes: [-20, 0, -16],
  school: [-18, 0, -36],
  futureGate: [0, 0, -72],
  mountainPillar: [36, 0, -84],
  safeRadius: 45,
  firstQuestId: 'first_siddur_pages',
  firstPrompt: 'Speak to the Rebbe and gather the scattered siddur pages.'
});

export const VILLAGE_GRASS_PATCHES = Object.freeze([
  { x: 0, z: -18, radius: 30, strength: 0.95 },
  { x: -24, z: -28, radius: 18, strength: 0.75 },
  { x: 26, z: -24, radius: 20, strength: 0.7 }
]);
