// B"H
/**
 * @file houses.js
 * @description
 * Chapter 94: The brick houses return.
 * The failed custom VillageCottage experiment is removed from active data.
 * Grounded VillagePictureProp recipes restore the richer brick/plaster cottage,
 * lantern, fence, well, flower patches, and collisions that obey terrain law.
 */
export default {
  VillageCottage: [],
  VillagePictureProp: [
    { name: "restored_brick_house_by_guide", kind: "gableHouse", position: { x: -1.6, z: 8.0 }, scale: 4.6, rotation: { y: -0.35 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "restored_second_brick_house_depth", kind: "gableHouse", position: { x: 13.5, z: -8.0 }, scale: 3.55, rotation: { y: 0.25 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "restored_lantern_by_path", kind: "lantern", position: { x: -8.8, z: 11.8 }, scale: 2.1, terrainLawGrounded: true, groundLift: 0 },
    { name: "restored_visible_well", kind: "well", position: { x: 4.4, z: 10.4 }, scale: 1.15, terrainLawGrounded: true, groundLift: 0 },
    { name: "restored_left_low_fence", kind: "fence", position: { x: -18, z: 11.5 }, scale: 1.55, rotation: { y: -0.28 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "restored_cottage_flowers", kind: "flowerPatch", count: 160, radius: 3.8, seed: 88, position: { x: -3.6, z: 10.2 }, scale: 1.25, terrainLawGrounded: true, groundLift: 0 },
    { name: "restored_tree_flowers", kind: "flowerPatch", count: 150, radius: 5.2, seed: 92, position: { x: -18, z: 13 }, scale: 1.25, terrainLawGrounded: true, groundLift: 0 }
  ],
  VillageHouseCollider: [
    { name: "restored_brick_house_collider", position: { x: -1.6, y: 0, z: 8.0 }, width: 16, depth: 11, height: 7, floorTop: 0.34 }
  ]
};
