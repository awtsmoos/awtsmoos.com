// B"H
/**
 * @file VillageFenceCollider.js
 * @description
 * Chapter 138: The visible left fence receives its matching rail body.
 * This section was not wired into the village index before. The target name now
 * matches the current visible fence: `reference_left_low_fence`.
 */
export default [
  {
    name: "reference_left_low_fence_collider",
    targetName: "reference_left_low_fence",
    length: 12.8,
    height: 1.65,
    depth: 0.55,
    position: { x: -16, y: 0, z: 11.5 },
    rotation: { y: -0.28 },
    useAuthoredY: true
  }
];
