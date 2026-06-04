// B"H
/**
 * @file houses.js
 * @description
 * Chapter 42: The cottages become landmarks, not boxes.
 * Existing VillagePictureProp recipes are arranged to create the right-side
 * village cluster from the target: cottage, warm lantern, flowers, fence, well.
 */
export default {
  VillagePictureProp: [
    { name: "reference_right_cottage_anchor", kind: "gableHouse", position: { x: 17.5, z: -7.8 }, scale: 4.6, rotationY: -0.18, terrainLawGrounded: true },
    { name: "reference_far_cottage_depth", kind: "gableHouse", position: { x: 31, z: -20 }, scale: 3.7, rotationY: 0.28, terrainLawGrounded: true },
    { name: "reference_path_lantern_left", kind: "lantern", position: { x: -7.8, z: 7.6 }, scale: 1.95, terrainLawGrounded: true },
    { name: "reference_house_lantern_right", kind: "lantern", position: { x: 12.7, z: -5.1 }, scale: 1.65, terrainLawGrounded: true },
    { name: "reference_house_ivy_flowers", kind: "flowerPatch", count: 128, radius: 3.4, seed: 88, position: { x: 13.5, z: -4.4 }, scale: 1.2, terrainLawGrounded: true },
    { name: "reference_tree_shadow_flowers", kind: "flowerPatch", count: 140, radius: 5.2, seed: 92, position: { x: -18, z: 11 }, scale: 1.25, terrainLawGrounded: true },
    { name: "reference_well_near_house", kind: "well", position: { x: 23.5, z: -1.8 }, scale: 1.25, terrainLawGrounded: true },
    { name: "reference_left_low_fence", kind: "fence", position: { x: -23, z: 8 }, scale: 1.6, rotationY: -0.28, terrainLawGrounded: true }
  ],
  VillageHouseCollider: [
    { name: "right_cottage_collider", position: { x: 17.5, y: 0, z: -7.8 }, width: 16, depth: 11, height: 6, floorTop: 0.34 }
  ]
};
