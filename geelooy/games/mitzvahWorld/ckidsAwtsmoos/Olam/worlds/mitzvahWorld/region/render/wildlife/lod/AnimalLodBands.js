// B"H
/**
 * @file AnimalLodBands.js
 * @description
 * Full animals stay crisp only where the player can really touch or fight
 * them. Passive herds quickly become simplified silhouettes so the scene keeps
 * its ecology without spending every frame on distant anatomy.
 */
export const ANIMAL_NEAR_OUT = 12;
export const ANIMAL_NEAR_IN = 7;
export const ANIMAL_MID_OUT = 64;
export const ANIMAL_MID_IN = 34;
export const BIRD_MID_IN = 48;

export default {
  ANIMAL_NEAR_OUT,
  ANIMAL_NEAR_IN,
  ANIMAL_MID_OUT,
  ANIMAL_MID_IN,
  BIRD_MID_IN
};
