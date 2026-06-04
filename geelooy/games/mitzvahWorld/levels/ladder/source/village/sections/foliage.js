// B"H
/**
 * @file foliage.js
 * @description
 * Chapter 118: The ground becomes a woven meadow, not a plain green sheet.
 * The reusable grass library now gives each blade its own shade. This level
 * feeds it richer patches around the house, guide path, fence, and tree roots.
 */
export default {
  VillageGrassField: [{
    name: "reference_meadow_grass_flowers_varied",
    count: 3200,
    tallRatio: 0.24,
    flowerRatio: 0.24,
    radius: 58,
    groundY: 0,
    groundLift: 0.014,
    shortColor: 0x4f9b3b,
    shortAltColor: 0x88b95d,
    tallColor: 0x2f7c31,
    tallAltColor: 0x6f9136,
    flowerColor: 0xe8d860,
    flowerAltColor: 0xdba3e8,
    patches: [
      { x: -18, z: 13, radius: 11 },
      { x: -8, z: 11, radius: 8 },
      { x: 0, z: 8, radius: 7 },
      { x: 8, z: 2, radius: 9 },
      { x: 16, z: -8, radius: 10 },
      { x: 23, z: -18, radius: 10 },
      { x: -22, z: -5, radius: 9 }
    ]
  }]
};
