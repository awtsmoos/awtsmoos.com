// B"H
/**
 * @file path.js
 * @description
 * Chapter 96: The path returns to the existing textured village recipes.
 * The experimental cobble class is disabled. Grounded pictureDirtPath and
 * cobbleRoad recipes restore the better authored path language and grounding.
 */
export default {
  VillageStonePath: [],
  VillagePictureProp: [
    { name: "restored_grounded_dirt_path_to_guide", kind: "pictureDirtPath", position: { x: -6.8, z: 12.8 }, scale: 1.08, rotation: { y: -0.24 }, terrainLawGrounded: true, groundLift: 0.01 },
    { name: "restored_cobble_path_by_house", kind: "cobbleRoad", position: { x: -4.6, z: 9.4 }, scale: 1.18, rotation: { y: -0.2 }, terrainLawGrounded: true, groundLift: 0.02 },
    { name: "restored_steps_to_brick_house", kind: "steps", position: { x: -2.2, z: 9.1 }, scale: 1.1, rotation: { y: -0.35 }, terrainLawGrounded: true, groundLift: 0.02 }
  ]
};
