// B"H
/**
 * @file VillagePictureProp.js
 * @description
 * Chapter 642: The village stops shouting and starts breathing.
 *
 * The Awtsmoos renews the field from speech every instant, but a first screen
 * still needs mercy: open grass, one clear path, readable homes, and props that
 * frame the player instead of swallowing the camera. This data keeps the world
 * complete while trimming the choppy clutter that made the old village feel
 * like a wall of separate fragments.
 */

const grounded = {
  terrainLawGrounded: true,
  groundLift: 0
};

const prop = (name, kind, position, options = {}) => ({
  name,
  kind,
  position,
  ...grounded,
  ...options
});

export default [
  prop("main_warm_house", "gableHouse", { x: 145, z: -110 }, {
    scale: 2.2,
    rotation: { y: -0.34 }
  }),
  prop("left_meadow_house", "gableHouse", { x: -120, z: 92 }, {
    scale: 2.3,
    rotation: { y: 0.52 }
  }),
  prop("right_orchard_house", "gableHouse", { x: 132, z: 96 }, {
    scale: 2.25,
    rotation: { y: -0.74 }
  }),
  prop("courtyard_well_readable_center", "well", { x: -3.8, z: 2.4 }, {
    scale: 1.12,
    rotation: { y: 0.42 }
  }),
  prop("guide_path_lantern_left", "lantern", { x: -9.5, z: 9.8 }, {
    scale: 1.18
  }),
  prop("guide_path_lantern_right", "lantern", { x: -2.4, z: 10.4 }, {
    scale: 1.12
  }),
  prop("oak_shadow_bench", "bench", { x: -16.4, z: 18.4 }, {
    scale: 1.18,
    rotation: { y: 0.72 }
  }),
  prop("courtyard_bench_right", "bench", { x: 7.2, z: 9.6 }, {
    scale: 1.02,
    rotation: { y: -0.5 }
  }),
  prop("front_soft_flower_arc", "flowerPatch", { x: -8.5, z: 13.2 }, {
    count: 46,
    radius: 3.0,
    seed: 73,
    scale: 1.0
  }),
  prop("left_tree_flowers", "flowerPatch", { x: -18, z: 13.2 }, {
    count: 62,
    radius: 4.2,
    seed: 92,
    scale: 1.05
  }),
  prop("quiet_front_meadow_detail", "meadowDetail", { x: 0, z: 0 }, {
    clusters: [[-18, 11], [-9, 8], [14, 11], [23, 16], [-26, 24], [30, 6]],
    scale: 1.05
  }),
  prop("left_low_fence_frame", "fence", { x: -28, z: 5 }, {
    count: 8,
    scale: 1.15,
    rotation: { y: 0.12 }
  }),
  prop("orchard_back_low_fence", "fence", { x: -18, z: 43 }, {
    count: 10,
    scale: 1.12,
    rotation: { y: 0.02 }
  }),
  prop("right_low_fence_frame", "fence", { x: 62, z: 20 }, {
    count: 9,
    scale: 1.05,
    rotation: { y: 1.32 }
  }),
  prop("path_small_rocks", "rock", { x: -5.4, z: 6.8 }, {
    count: 8,
    radius: 1.2,
    seed: 4,
    scale: 0.9
  }),
  prop("left_scattered_rocks_soft", "rockField", { x: -45, z: 4 }, {
    count: 24,
    radius: 13,
    seed: 6,
    scale: 0.78
  }),
  prop("right_scattered_rocks_soft", "rockField", { x: 43, z: 12 }, {
    count: 22,
    radius: 12,
    seed: 29,
    scale: 0.74
  })
];
