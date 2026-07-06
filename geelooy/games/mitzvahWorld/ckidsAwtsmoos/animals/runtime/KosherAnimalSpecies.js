// B"H
/** @file KosherAnimalSpecies.js @description Kosher living creatures replace generic hostile filler. */
export const KOSHER_ANIMAL_SPECIES = Object.freeze({ sheep:{ herd:true, wool:true }, goat:{ herd:true, horns:true }, cow:{ herd:true, milk:true }, deer:{ herd:true, antlers:true }, gazelle:{ herd:true, swift:true }, chicken:{ flock:true, eggs:true }, turkey:{ flock:true }, duck:{ flock:true, water:true }, goose:{ flock:true, water:true }, fish:{ school:true, water:true }, dove:{ flock:true, gentle:true }, pigeon:{ flock:true, city:true } });
export function speciesProfile(species) { return { species, ...(KOSHER_ANIMAL_SPECIES[species] || { custom:true }) }; }
export function listKosherSpecies() { return Object.keys(KOSHER_ANIMAL_SPECIES); }
export default KOSHER_ANIMAL_SPECIES;
