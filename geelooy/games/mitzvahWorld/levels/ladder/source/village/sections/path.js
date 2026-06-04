// B"H
/**
 * @file path.js
 * @description
 * Chapter 121: The path leads the eye instead of splashing random tiles.
 * Roads remain visual-only for safety after the NaN raycast warning, but their
 * placement now creates a clear line from player spawn to guide and house.
 */
export default {
  VillageStonePath: [],
  VillagePictureProp: [
    { name: "reference_main_dirt_path_to_guide", kind: "pictureDirtPath", position: { x: -7.4, z: 12.6 }, scale: 1.12, rotation: { y: -0.18 }, terrainLawGrounded: true, groundLift: 0.01 },
    { name: "reference_house_cobble_arrival", kind: "cobbleRoad", position: { x: -0.8, z: 8.2 }, scale: 1.1, rotation: { y: -0.28 }, terrainLawGrounded: true, groundLift: 0.02 },
    { name: "reference_door_steps_flush", kind: "steps", position: { x: 3.0, z: 8.0 }, scale: 1.05, rotation: { y: -0.25 }, terrainLawGrounded: true, groundLift: 0.02 },
    { name: "reference_lantern_cobble_pad", kind: "cobbleRoad", position: { x: -7.4, z: 10.5 }, scale: 0.55, rotation: { y: 0.15 }, terrainLawGrounded: true, groundLift: 0.02 }
  ],
  VillageRoadCollider: []
};
