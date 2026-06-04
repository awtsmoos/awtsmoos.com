// B"H
/**
 * @file trees.js
 * @description
 * Stabilized trees. Enough visible trees to read as a village, not a broken
 * forest. Uses the stable picture prop recipe system only.
 */
export default {
  VillageHeroTree: [],
  VillageTreeField: [],
  VillagePictureProp: [
    { name: "stable_left_anchor_tree", kind: "pictureAnchorTree", position: { x: -18, z: 14 }, scale: 1.25, rotation: { y: -0.3 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "stable_mid_tree", kind: "pictureAnchorTree", position: { x: 10, z: -5 }, scale: 0.78, rotation: { y: 0.8 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "stable_far_tree", kind: "pictureAnchorTree", position: { x: 24, z: -22 }, scale: 0.62, rotation: { y: -1.1 }, terrainLawGrounded: true, groundLift: 0 }
  ]
};
