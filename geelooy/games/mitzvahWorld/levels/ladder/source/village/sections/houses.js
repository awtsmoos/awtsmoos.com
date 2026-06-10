// B"H
/**
 * @file houses.js
 * @description
 * Chapter 614: The village keeps visual houses only.
 *
 * The phone showed invisible house colliders offset from the brick body. Until
 * the collision hull can be drawn/debugged in the live viewport, no invisible
 * house wall may enter the octree. Better no wall than a false wall.
 */
export default {
  VillageCottage: [],
  VillagePictureProp: [
    { name: "reference_main_brick_house", kind: "gableHouse", position: { x: 4.8, z: 5.6 }, scale: 3.25, rotation: { y: -0.25 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "reference_far_brick_house", kind: "gableHouse", position: { x: 24, z: -18 }, scale: 2.35, rotation: { y: 0.35 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "reference_lantern_by_path", kind: "lantern", position: { x: -7.4, z: 10.8 }, scale: 1.6, terrainLawGrounded: true, groundLift: 0 },
    { name: "reference_visible_well", kind: "well", position: { x: 9.5, z: 10.4 }, scale: 1.0, terrainLawGrounded: true, groundLift: 0 },
    { name: "reference_left_low_fence", kind: "fence", position: { x: -16, z: 11.5 }, scale: 1.35, rotation: { y: -0.28 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "reference_house_flower_border", kind: "flowerPatch", count: 210, radius: 3.8, seed: 88, position: { x: 1.8, z: 8.2 }, scale: 1.08, terrainLawGrounded: true, groundLift: 0 },
    { name: "reference_tree_flower_border", kind: "flowerPatch", count: 210, radius: 5.8, seed: 92, position: { x: -18, z: 13 }, scale: 1.1, terrainLawGrounded: true, groundLift: 0 },
    { name: "reference_path_meadow_detail", kind: "meadowDetail", count: 120, radius: 5.2, seed: 122, position: { x: -8, z: 10.8 }, scale: 1.0, terrainLawGrounded: true, groundLift: 0 }
  ],
  VillageHouseCollider: []
};
