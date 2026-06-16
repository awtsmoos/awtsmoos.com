// B"H
/** Gentle animal loops plus corpse/loot table for later combat integration. */
export const LEVEL_ONE_ANIMAL_LOOT = Object.freeze({
  village_sheep: { peaceful: ['wool_bundle'], defeated: ['kosher_hide'] },
  village_goat: { peaceful: ['milk_jug'], defeated: ['kosher_hide'] }
});

export const LEVEL_ONE_ANIMAL_OBJECTS = Object.freeze([
  { id: 'sheep_wool_marker', type: 'flower', position: [31, 0, -24], props: { interaction: 'animal_loot', animalId: 'village_sheep', itemId: 'wool_bundle', ask: 'Gather clean wool?' } },
  { id: 'animal_corpse_training_marker', type: 'flower', position: [35, 0, -27], props: { interaction: 'carcass_loot', animalId: 'village_sheep', itemId: 'kosher_hide', ask: 'Collect kosher hide for the merchant?' } }
]);
