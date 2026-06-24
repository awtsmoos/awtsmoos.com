// B"H
/** @file AnimalSpeciesCatalog.js @description Species are parameters, not draw calls. */
export const ANIMAL_SPECIES = Object.freeze({
  rabbit:{ prey:true, food:"grass", fear:.92, speed:1.55, group:12, biome:"farmBelt", state:"graze", scale:.55, ears:1.35, memory:"burrow" },
  fox:{ predator:"rabbit", fear:.18, speed:1.38, group:4, biome:"forestBelt", state:"hunt", scale:.78, tail:1.45, memory:"den" },
  deer:{ prey:true, food:"meadow", fear:.72, speed:1.24, group:8, biome:"forestBelt", state:"graze", scale:1.12, neck:1.25, memory:"trail" },
  frog:{ water:true, fear:.45, speed:.72, group:10, biome:"marshlands", state:"drink", scale:.36, jump:1.5, memory:"pond" },
  goat:{ slope:true, food:"scrub", fear:.36, speed:.88, group:6, biome:"rockyHighlands", state:"climb", scale:.9, horns:1.15, memory:"ridge" },
  bird:{ flight:true, fear:.55, speed:1.8, group:16, biome:"wilderness", state:"flock", scale:.22, wing:1.4, memory:"nest" },
  cow:{ food:"grass", fear:.25, speed:.48, group:5, biome:"farmBelt", state:"graze", scale:1.45, weight:1.5, memory:"barn" },
  sheep:{ food:"grass", fear:.5, speed:.62, group:9, biome:"farmBelt", state:"graze", scale:.82, wool:1.4, memory:"flock" }
});
export function speciesTraits(species){ return ANIMAL_SPECIES[species] || ANIMAL_SPECIES.rabbit; }
export default ANIMAL_SPECIES;
