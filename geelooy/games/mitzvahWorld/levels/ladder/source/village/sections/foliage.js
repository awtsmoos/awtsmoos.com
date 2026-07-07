// B"H
/**
 * @file foliage.js
 * @description
 * Chapter 860: grass and forest return as LOD vessels, not frame-killing clutter.
 * The legacy VillageGrassField vessel stays empty because mobile browsers could
 * render its old atlas as black blades. Dense grass is supplied by the living
 * region procedural renderer instead.
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
  VillageGrassField: []
};
