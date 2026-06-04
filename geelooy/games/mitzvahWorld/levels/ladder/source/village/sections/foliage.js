// B"H
/**
 * @file foliage.js
 * @description
 * Chapter 91: The grass obeys readability.
 * Dense foreground life remains, but the guide and path get a small visible
 * clearing so the NPC is not swallowed by a wall of blades.
 */
export default {
  VillageGrassField: [{
    name: "readable_spawn_grass_and_flowers",
    count: 3000,
    tallRatio: 0.28,
    flowerRatio: 0.22,
    radius: 62,
    groundY: 0,
    groundLift: 0.014,
    shortColor: 0x4f9b3b,
    tallColor: 0x347a2e,
    flowerColor: 0xe8d860,
    patches: [
      { x: -18, z: 13, radius: 12 },
      { x: -12, z: 17, radius: 8 },
      { x: -2, z: 12, radius: 7 },
      { x: 6, z: 4, radius: 10 },
      { x: 14, z: -5, radius: 9 }
    ]
  }]
};
