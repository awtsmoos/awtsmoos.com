// B"H
/**
 * @file trees.js
 * @description
 * Chapter 37: Trees become composition, not clutter.
 * One hero tree anchors the left foreground like the reference image; lighter
 * background tree fields give depth without swallowing Android performance.
 */
export default {
  VillageHeroTree: [{
    name: "left_spawn_reference_hero_tree",
    trunkHeight: 9.4,
    limbCount: 42,
    leafCount: 780,
    crownRadius: 6.8,
    crownHeight: 4.4,
    scale: 1.22,
    rotationY: -0.3,
    barkColor: 0x5a341d,
    branchColor: 0x4d2d19,
    leafColor: 0x4c9635,
    position: { x: -21, y: 0.02, z: 15 }
  }],
  VillageTreeField: [
    { name: "far_left_soft_tree_depth", count: 14, radius: 70, seed: 52, groundY: 0, position: { x: -76, y: 0, z: 42 }, leafBrightness: 1.28 },
    { name: "far_right_soft_tree_depth", count: 14, radius: 72, seed: 71, groundY: 0, position: { x: 88, y: 0, z: 52 }, leafBrightness: 1.28 },
    { name: "north_horizon_soft_tree_depth", count: 16, radius: 94, seed: 31, groundY: 0, position: { x: 8, y: 0, z: -92 }, leafBrightness: 1.28 }
  ]
};
