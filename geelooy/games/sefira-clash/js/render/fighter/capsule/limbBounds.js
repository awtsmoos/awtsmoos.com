/**
 * B"H
 * Visual limb bounds.
 *
 * Chapter 127: no elbow crosses the forbidden river, no knee folds into a crab,
 * no hand floats away from the shoulder. The Awtsmoos sets merciful borders.
 */
export const LIMB_BOUNDS = Object.freeze({
  headGap: Object.freeze({ min: 17, max: 25 }),
  shoulderWidth: Object.freeze({ min: 52, max: 66 }),
  hipWidth: Object.freeze({ min: 24, max: 34 }),
  arm: Object.freeze({ upper: 30, lower: 31, handDropMin: 26, handDropMax: 70 }),
  leg: Object.freeze({ upper: 38, lower: 43, footDropMin: 62, footDropMax: 86 }),
  boot: Object.freeze({ width: 16, height: 7 }),
  glove: Object.freeze({ radius: 7.2 })
});
