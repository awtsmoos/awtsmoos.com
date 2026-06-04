// B"H
/**
 * @file foliage.js
 * @description
 * Chapter 39: The grass is placed as art-direction, not random noise.
 * Dense patches hug the hero tree, the path edges, and the guide house so the
 * opening view reads lush while still staying inside mobile budgets.
 */
export default {
  VillageGrassField: [{
    name: "reference_spawn_grass_and_flowers",
    count: 3600,
    tallRatio: 0.36,
    flowerRatio: 0.24,
    radius: 72,
    groundY: 0,
    groundLift: 0.014,
    shortColor: 0x4f9b3b,
    tallColor: 0x347a2e,
    flowerColor: 0xe8d860,
    patches: [
      { x: -18, z: 12, radius: 14 }, { x: -5, z: 10, radius: 12 },
      { x: 8, z: 0, radius: 13 }, { x: 17, z: -7, radius: 11 }
    ]
  }]
};
