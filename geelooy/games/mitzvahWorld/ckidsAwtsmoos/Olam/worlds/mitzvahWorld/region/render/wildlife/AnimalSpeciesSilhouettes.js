// B"H
/**
 * @file AnimalSpeciesSilhouettes.js
 * @description Cheap LOD silhouettes derived from the shared anatomy catalog.
 */
import { ANIMAL_ANATOMY, animalAnatomy } from "./anatomy/AnimalAnatomyCatalog.js?compact=true&v=animal-realism-split-20260705-bh1";

function silhouetteFrom(anatomy) {
  return {
    color:anatomy.color,
    accent:anatomy.accent,
    dark:anatomy.dark,
    body:anatomy.body,
    chest:anatomy.chest,
    head:anatomy.head,
    snout:anatomy.snout,
    neck:anatomy.neck,
    legs:anatomy.legs,
    ears:anatomy.ears,
    horns:anatomy.horns,
    tail:anatomy.tail,
    wings:anatomy.wings,
    eyes:anatomy.eyes,
    marks:anatomy.marks || [],
    low:anatomy.posture === "crouched",
    flying:anatomy.posture === "winged",
    anatomyScore:anatomy.score
  };
}

export const SILHOUETTES = Object.freeze(Object.fromEntries(
  Object.entries(ANIMAL_ANATOMY).map(([species, anatomy]) => [species, Object.freeze(silhouetteFrom(anatomy))])
));

export function silhouetteFor(species = "rabbit") {
  return SILHOUETTES[species] || silhouetteFrom(animalAnatomy(species));
}

export default silhouetteFor;
