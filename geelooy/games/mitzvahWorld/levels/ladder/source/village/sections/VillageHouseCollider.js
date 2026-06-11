// B"H
/**
 * @file VillageHouseCollider.js
 * @description
 * Chapter 643: The invisible house walls follow the houses out of frame.
 *
 * These are not scenery. They are quiet physics letters, hidden from the eye
 * but present to the feet, so the Awtsmoos lets the player walk around homes
 * without the first camera being swallowed by a collider-sized stone page.
 */

const collider = (name, targetName, position, rotationY, scale = 1) => ({
  name,
  targetName,
  width: 34 * scale,
  depth: 23 * scale,
  height: 13.6 * scale,
  floorTop: 0.058,
  thickness: 0.85,
  position,
  rotation: { y: rotationY },
  useAuthoredY: true,
  thresholdCollider: false,
  contractDriven: true,
  useVisualHouseY: true,
  doorWidth: 5.1 * scale,
  doorClearHeight: 4.65 * scale
});

export default [
  collider("main_house_fitted_colliders", "main_warm_house", { x: 145, y: 0, z: -110 }, -0.34, 0.64),
  collider("left_house_fitted_colliders", "left_meadow_house", { x: -120, y: 0, z: 92 }, 0.52, 0.68),
  collider("right_house_fitted_colliders", "right_orchard_house", { x: 132, y: 0, z: 96 }, -0.74, 0.66)
];
