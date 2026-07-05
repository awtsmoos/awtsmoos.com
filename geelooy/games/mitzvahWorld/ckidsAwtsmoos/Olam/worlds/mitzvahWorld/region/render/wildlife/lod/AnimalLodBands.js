// B"H
/**
 * B"H
 *
 * Wildlife LOD bands let the field stay alive without turning every distant
 * creature into full geometry. Near receives the full single-mesh animal, mid
 * receives anatomy, and far receives a cheap but intentional silhouette.
 */
export const ANIMAL_NEAR_OUT = 48;
export const ANIMAL_NEAR_IN = 36;
export const ANIMAL_MID_OUT = 118;
export const ANIMAL_MID_IN = 96;
export const BIRD_MID_IN = 150;

export default { ANIMAL_NEAR_OUT, ANIMAL_NEAR_IN, ANIMAL_MID_OUT, ANIMAL_MID_IN, BIRD_MID_IN };
