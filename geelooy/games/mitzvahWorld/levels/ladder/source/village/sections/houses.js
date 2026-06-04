// B"H
/**
 * @file houses.js
 * @description
 * Stabilized house layout. No overlapping houses. One main brick house is set
 * back from spawn, one smaller depth house is far away, all grounded.
 */
export default {
  VillageCottage: [],
  VillagePictureProp: [
    { name: "stable_main_brick_house", kind: "gableHouse", position: { x: 4.5, z: 5.8 }, scale: 3.35, rotation: { y: -0.25 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "stable_far_brick_house", kind: "gableHouse", position: { x: 22, z: -15 }, scale: 2.65, rotation: { y: 0.35 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "stable_lantern_by_path", kind: "lantern", position: { x: -7.4, z: 10.8 }, scale: 1.45, terrainLawGrounded: true, groundLift: 0 },
    { name: "stable_visible_well", kind: "well", position: { x: 8.8, z: 10.6 }, scale: 0.95, terrainLawGrounded: true, groundLift: 0 },
    { name: "stable_left_low_fence", kind: "fence", position: { x: -16, z: 11.5 }, scale: 1.25, rotation: { y: -0.28 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "stable_cottage_flowers", kind: "flowerPatch", count: 140, radius: 3.4, seed: 88, position: { x: 1.8, z: 8.2 }, scale: 1.0, terrainLawGrounded: true, groundLift: 0 },
    { name: "stable_tree_flowers", kind: "flowerPatch", count: 130, radius: 5.2, seed: 92, position: { x: -18, z: 13 }, scale: 1.05, terrainLawGrounded: true, groundLift: 0 }
  ],
  VillageHouseCollider: [
    { name: "stable_main_brick_house_collider", targetName: "stable_main_brick_house", position: { x: 4.5, y: 0, z: 5.8 }, width: 11, depth: 8, height: 6, floorTop: 0.34 }
  ]
};
