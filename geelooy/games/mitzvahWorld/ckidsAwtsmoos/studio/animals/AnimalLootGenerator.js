// B"H
const LOOT = Object.freeze({
  fox:["fox_fur", "sharp_tooth"],
  goat:["goat_milk", "small_horn"],
  cow:["milk", "hide"],
  deer:["venison", "antler"],
  rabbit:["soft_fur"],
  frog:["pond_herb"],
  bird:["feather"],
  chicken:["egg", "feather"],
  boar:["boar_hide", "tusk"],
  sheep:["wool_bundle"],
  dog:["collar_tag"],
  horse:["horse_hair"]
});

export function generateAnimalLoot(species = "fox") {
  return {
    id:`${species}Loot`,
    species,
    entries:(LOOT[species] || ["animal_good"]).map((itemId, index) => ({ itemId, min:1, max:index ? 1 : 2, weight:index ? .35 : .75 })),
    corpseClickable:true,
    sellable:true
  };
}

export default { generateAnimalLoot };
