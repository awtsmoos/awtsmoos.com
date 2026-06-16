// B"H
/** @file GrassSpeciesPalette.js @description Meadow species palette for richer grass ecology. */
export const GRASS_SPECIES = Object.freeze([
  { id:"short_meadow", color:0x477b35, height:.42, density:1.0, bladeWidth:.018, nearRoad:.45 },
  { id:"tall_edge", color:0x5f8f3a, height:.86, density:.72, bladeWidth:.024, nearRoad:.2 },
  { id:"dry_straw", color:0xb49b54, height:.58, density:.38, bladeWidth:.02, nearRoad:.65 },
  { id:"clover_low", color:0x2f7032, height:.24, density:.55, bladeWidth:.026, nearRoad:.28 },
  { id:"yard_weeds", color:0x6f9140, height:.35, density:.48, bladeWidth:.019, nearRoad:.35 },
  { id:"water_reeds", color:0x789c49, height:1.05, density:.28, bladeWidth:.032, nearRoad:.05 }
]);
export function grassSpeciesById(id) { return GRASS_SPECIES.find(s => s.id === id) || GRASS_SPECIES[0]; }
export function grassPaletteStats() { return { species:GRASS_SPECIES.length, ids:GRASS_SPECIES.map(s => s.id), complexGrainyGrass:true, trampleReady:true, ecologyReady:true }; }
export default GRASS_SPECIES;
