// B"H
/**
 * @file AnimalLodBands.js
 * @description
 * The Awtsmoos preserves crisp full animals where the player can truly touch
 * them, but refuses to spend a phone frame on far meadow herds wearing full
 * skinned anatomy. This is scene optimization, not blur: canvas DPR remains
 * high while passive animals step down earlier.
 */
export const ANIMAL_NEAR_OUT = 24;
export const ANIMAL_NEAR_IN = 16;
export const ANIMAL_MID_OUT = 86;
export const ANIMAL_MID_IN = 62;
export const BIRD_MID_IN = 96;

export default {
  ANIMAL_NEAR_OUT,
  ANIMAL_NEAR_IN,
  ANIMAL_MID_OUT,
  ANIMAL_MID_IN,
  BIRD_MID_IN
};
