// B"H
/**
 * @file AnimalLodBands.js
 * @description
 * Full animal bodies are reserved for touch, combat, and close inspection.
 * Passive herds switch to one-mesh silhouettes quickly, which keeps the animals
 * present while protecting the mobile movement frame budget.
 */
export const ANIMAL_NEAR_OUT = 8;
export const ANIMAL_NEAR_IN = 4.25;
export const ANIMAL_MID_OUT = 42;
export const ANIMAL_MID_IN = 16;
export const BIRD_MID_IN = 22;

export default {
  ANIMAL_NEAR_OUT,
  ANIMAL_NEAR_IN,
  ANIMAL_MID_OUT,
  ANIMAL_MID_IN,
  BIRD_MID_IN
};
