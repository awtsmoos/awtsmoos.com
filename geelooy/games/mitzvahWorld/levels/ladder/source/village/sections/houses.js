// B"H
/**
 * @file houses.js
 * @description
 * Chapter 50: The cottage stops pretending and becomes its own generated body.
 * VillageCottage carries plaster, roof tiles, door, windows, ivy, and lanterns;
 * smaller props orbit it as composition marks: well, fence, flowers, path light.
 */
export default {
  VillageCottage: [
    { name: "reference_right_cottage_anchor", width: 8.5, depth: 6.2, height: 4.3, scale: 1.05, rotationY: -0.18, position: { x: 17.5, y: 0.06, z: -7.8 } },
    { name: "reference_far_cottage_depth", width: 7.5, depth: 5.5, height: 3.8, scale: 0.86, rotationY: 0.28, position: { x: 31, y: 0.05, z: -20 } }
  ],
  VillagePictureProp: [
    { name: "reference_path_lantern_left", kind: "lantern", position: { x: -7.8, z: 7.6 }, scale: 1.95, terrainLawGrounded: true },
    { name: "reference_house_ivy_flowers", kind: "flowerPatch", count: 128, radius: 3.4, seed: 88, position: { x: 13.5, z: -4.4 }, scale: 1.2, terrainLawGrounded: true },
    { name: "reference_tree_shadow_flowers", kind: "flowerPatch", count: 140, radius: 5.2, seed: 92, position: { x: -18, z: 11 }, scale: 1.25, terrainLawGrounded: true },
    { name: "reference_well_near_house", kind: "well", position: { x: 23.5, z: -1.8 }, scale: 1.25, terrainLawGrounded: true },
    { name: "reference_left_low_fence", kind: "fence", position: { x: -23, z: 8 }, scale: 1.6, rotationY: -0.28, terrainLawGrounded: true }
  ],
  VillageHouseCollider: [
    { name: "right_cottage_collider", position: { x: 17.5, y: 0, z: -7.8 }, width: 16, depth: 11, height: 6, floorTop: 0.34 }
  ]
};
