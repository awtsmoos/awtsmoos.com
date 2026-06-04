// B"H
/**
 * @file trees.js
 * @description
 * Chapter 119: The village regains depth through staged trees.
 * No experimental hero tree, no black leaves, no flat forest wall. Just stable
 * picture-prop trees placed like a real village: one anchor, two mid trees,
 * and distant silhouettes so the camera sees layers instead of emptiness.
 */
export default {
  VillageHeroTree: [],
  VillageTreeField: [],
  VillagePictureProp: [
    { name: "reference_left_anchor_tree", kind: "pictureAnchorTree", position: { x: -18, z: 14 }, scale: 1.35, rotation: { y: -0.3 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "reference_path_mid_tree", kind: "pictureAnchorTree", position: { x: 9.5, z: -4.5 }, scale: 0.86, rotation: { y: 0.8 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "reference_right_depth_tree", kind: "pictureAnchorTree", position: { x: 22, z: -18 }, scale: 0.78, rotation: { y: -1.1 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "reference_far_hill_tree_left", kind: "pictureAnchorTree", position: { x: -30, z: -18 }, scale: 0.55, rotation: { y: 0.4 }, terrainLawGrounded: true, groundLift: 0 },
    { name: "reference_far_hill_tree_right", kind: "pictureAnchorTree", position: { x: 34, z: -28 }, scale: 0.58, rotation: { y: -0.7 }, terrainLawGrounded: true, groundLift: 0 }
  ]
};
