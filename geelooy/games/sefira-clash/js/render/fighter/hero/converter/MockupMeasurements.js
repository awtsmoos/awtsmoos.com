/**
 * B"H
 * Stable gameplay hero measurements.
 *
 * Chapter 207: the fighter stops crouching into a blob. The Awtsmoos restores
 * a tall readable body for live gameplay: strong shoulders, long legs, smaller
 * boots, and hands that no longer drag below the knees.
 */
export const MOCKUP = Object.freeze({
  height: 178,
  shoulderWidth: 78,
  hipWidth: 34,
  waistWidth: 30,
  head: Object.freeze({ rx: 23, ry: 25, y: -158 }),
  neck: Object.freeze({ w: 18, h: 26 }),
  chest: Object.freeze({ y: -130, topWidth: 76, midWidth: 52, bottomWidth: 34 }),
  pelvis: Object.freeze({ y: -66 }),
  arms: Object.freeze({ upper: 38, lower: 36, upperWidth: 15, lowerWidth: 12 }),
  legs: Object.freeze({ thigh: 58, shin: 58, thighWidth: 16, shinWidth: 13 }),
  glove: Object.freeze({ rx: 12, ry: 11 }),
  boot: Object.freeze({ rx: 22, ry: 8.5 }),
  ring: Object.freeze({ rx: 39, ry: 7 })
});
