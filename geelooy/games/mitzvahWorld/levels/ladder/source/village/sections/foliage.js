// B"H
/**
 * @file foliage.js
 * @description
 * Chapter 860: grass and forest return as LOD vessels, not frame-killing clutter.
 * Thousands of blades and hundreds of trees are present through instancing, so
 * the village becomes alive while gameplay keeps the breath of 60fps.
 */
export default {
  VillageForestField: [{
    name: "village_outer_many_tree_lod_forest",
    count: 320,
    seed: 613,
    scale: 1.12,
    patches: [
      { x:-86, z:-62, radius:42 }, { x:94, z:-66, radius:46 },
      { x:-104, z:72, radius:48 }, { x:108, z:76, radius:50 },
      { x:-34, z:-90, radius:34 }, { x:46, z:92, radius:38 },
      { x:-62, z:18, radius:30 }, { x:74, z:20, radius:32 }
    ]
  }],
  VillageGrassField: [{
    name: "village_dense_instanced_lod_grass_and_flowers",
    count: 5200,
    seed: 411,
    groundLift: 0.014,
    tallRatio: 0.22,
    flowerRatio: 0.12,
    patches: [
      { x:13, z:-11, radius:18 }, { x:-46, z:27, radius:18 },
      { x:57, z:33, radius:18 }, { x:-11, z:12, radius:17 },
      { x:76, z:22, radius:16 }, { x:-25, z:17, radius:16 },
      { x:38, z:26, radius:16 }, { x:0, z:4, radius:18 },
      { x:-70, z:-16, radius:28 }, { x:78, z:-8, radius:30 },
      { x:-75, z:70, radius:30 }, { x:88, z:70, radius:28 }
    ]
  }]
};
