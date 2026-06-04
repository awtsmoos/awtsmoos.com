// B"H
/**
 * @file trees.js
 * @description
 * Chapter 95: The bad solid-plane hero tree is removed from active data.
 * The grounded pictureAnchorTree recipe returns, using the existing village
 * texture/grounding algorithms instead of the failed experimental tree class.
 */
export default {
  VillageHeroTree: [],
  VillageTreeField: [],
  VillagePictureProp: [
    { name: "restored_grounded_anchor_tree_left", kind: "pictureAnchorTree", position: { x: -20, z: 15 }, scale: 1.7, rotation: { y: -0.3 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "restored_grounded_mid_tree_by_house", kind: "pictureAnchorTree", position: { x: 5.5, z: 2.0 }, scale: 1.05, rotation: { y: 0.8 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "restored_grounded_right_depth_tree", kind: "pictureAnchorTree", position: { x: 15, z: -10 }, scale: 0.92, rotation: { y: -1.1 }, terrainLawGrounded: true, groundLift: 0 }
  ]
};
