// B"H
/**
 * @file foliage.js
 * @description
 * Stabilized grass. Enough grass and flowers to see life, but not so much that
 * it hides the NPC or makes the player feel buried.
 */
export default {
  VillageGrassField: [{
    name: "stable_visible_grass_and_flowers",
    count: 1700,
    tallRatio: 0.18,
    flowerRatio: 0.16,
    radius: 52,
    groundY: 0,
    groundLift: 0.014,
    shortColor: 0x4f9b3b,
    tallColor: 0x347a2e,
    flowerColor: 0xe8d860,
    patches: [
      { x: -18, z: 13, radius: 9 },
      { x: -3, z: 11, radius: 6 },
      { x: 8, z: 2, radius: 8 },
      { x: 18, z: -9, radius: 8 }
    ]
  }]
};
