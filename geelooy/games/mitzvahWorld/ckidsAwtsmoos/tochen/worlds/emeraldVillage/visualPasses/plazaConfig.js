// B"H
/**
 * @file plazaConfig.js
 * @description Chapter 293: The plaza is specified as a radial map before
 * stones descend into the village.
 */
export const PLAZA = Object.freeze({
  center: Object.freeze({ x: 0, z: -4 }),
  baseSize: Object.freeze([36, 0.12, 36]),
  outer: Object.freeze({ count: 32, radius: 18, y: 0.16, size: [1.4, 0.22, 0.9] }),
  inner: Object.freeze({ count: 20, radius: 9, y: 0.18, size: [1.1, 0.2, 0.7] }),
  flowers: Object.freeze({ id: 'entry_gold_white_flowers', x: 0, z: 5, radius: 12, count: 360 })
});
