// B"H
/**
 * @file houses.js
 * @description
 * Chapter 86: The house moves into the opening shot.
 * The first cottage is now near the guide and path so Android players see both
 * immediately. Props are close, readable, and support the reference composition.
 */
export default {
  VillageCottage: [
    { name: "spawn_visible_right_cottage_anchor", width: 9.2, depth: 6.6, height: 4.5, scale: 1.12, rotationY: -0.35, position: { x: -1.6, y: 0.08, z: 8.0 } },
    { name: "mid_depth_second_cottage", width: 7.5, depth: 5.5, height: 3.8, scale: 0.9, rotationY: 0.25, position: { x: 13.5, y: 0.06, z: -8.0 } }
  ],
  VillagePictureProp: [
    { name: "spawn_path_lantern_left", kind: "lantern", position: { x: -8.8, z: 11.8 }, scale: 2.1, terrainLawGrounded: true },
    { name: "cottage_flower_cluster", kind: "flowerPatch", count: 160, radius: 3.8, seed: 88, position: { x: -3.6, z: 10.2 }, scale: 1.25, terrainLawGrounded: true },
    { name: "hero_tree_flower_cluster", kind: "flowerPatch", count: 150, radius: 5.2, seed: 92, position: { x: -18, z: 13 }, scale: 1.25, terrainLawGrounded: true },
    { name: "visible_cottage_well", kind: "well", position: { x: 4.4, z: 10.4 }, scale: 1.15, terrainLawGrounded: true },
    { name: "left_low_fence_near_spawn", kind: "fence", position: { x: -18, z: 11.5 }, scale: 1.55, rotationY: -0.28, terrainLawGrounded: true }
  ],
  VillageHouseCollider: [
    { name: "spawn_cottage_collider", position: { x: -1.6, y: 0, z: 8.0 }, width: 14, depth: 10, height: 6, floorTop: 0.34 }
  ]
};
