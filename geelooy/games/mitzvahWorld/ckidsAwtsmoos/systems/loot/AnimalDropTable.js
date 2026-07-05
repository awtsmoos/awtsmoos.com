// B"H
/** @file AnimalDropTable.js @description Kid-safe wildlife drop tables. */
export const ANIMAL_DROP_TABLE = Object.freeze({
  deer:["deer_antler", "deer_hide_token"],
  fox:["fox_tail_token", "fox_fur"],
  cow:["milk_token"],
  goat:["goat_wool", "goat_horn"],
  rabbit:["soft_fur"],
  frog:["frog_charm"],
  bird:["feather"]
});

export function dropsForAnimal(species = "creature") {
  return ANIMAL_DROP_TABLE[species] || ["gift_token", "perutah_token"];
}

export default { ANIMAL_DROP_TABLE, dropsForAnimal };
