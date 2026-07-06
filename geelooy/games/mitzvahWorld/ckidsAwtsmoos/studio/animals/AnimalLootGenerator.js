// B"H
import { harvestAnimal } from "../../platform/MitzvahPlatformCatalog.js";

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
  const normal = harvestAnimal(species, { proper:false });
  const proper = harvestAnimal(species, { tool:"shechitaKnife" });
  const entries = (normal.outputs.length ? normal.outputs : (LOOT[species] || ["animal_good"]))
    .map((itemId, index) => ({ itemId, min:1, max:index ? 1 : 2, weight:index ? .35 : .75, usableForFood:false }));
  return {
    id:`${species}Loot`,
    species,
    kosherSpecies:normal.kosherSpecies,
    entries,
    properHarvestEntries:proper.outputs.map((itemId, index) => ({ itemId, min:1, max:index ? 1 : 2, weight:index ? .35 : .75, usableForFood:proper.usableForFood })),
    corpseClickable:true,
    sellable:true,
    ruleNote:proper.note
  };
}

export default { generateAnimalLoot };
