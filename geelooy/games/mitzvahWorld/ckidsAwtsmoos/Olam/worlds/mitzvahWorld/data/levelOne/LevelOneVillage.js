// B"H
import { LEVEL_ONE_TERRAIN } from './LevelOneTerrain.js?compact=true&v=budgeted-village-20260707-bh1';
import { LEVEL_ONE_BUILDINGS } from './LevelOneBuildings.js?compact=true&v=budgeted-village-20260707-bh1';
import { LEVEL_ONE_NPCS } from './LevelOneNpcs.js?compact=true&v=budgeted-village-20260707-bh1';
import { LEVEL_ONE_LANDMARKS } from './LevelOneLandmarks.js?compact=true&v=budgeted-village-20260707-bh1';
import { LEVEL_ONE_OBJECTIVES } from './LevelOneObjectives.js?compact=true&v=budgeted-village-20260707-bh1';
import { LEVEL_ONE_INTERACTIVES } from './LevelOneInteractives.js?compact=true&v=budgeted-village-20260707-bh1';
import { LEVEL_ONE_FARM_OBJECTS } from './LevelOneFarming.js?compact=true&v=budgeted-village-20260707-bh1';
import { LEVEL_ONE_ANIMAL_OBJECTS } from './LevelOneAnimals.js?compact=true&v=budgeted-village-20260707-bh1';

export const LEVEL_ONE_VILLAGE_NIVRAYIM = Object.freeze([
  ...LEVEL_ONE_TERRAIN,
  ...LEVEL_ONE_BUILDINGS,
  ...LEVEL_ONE_LANDMARKS,
  ...LEVEL_ONE_NPCS,
  ...LEVEL_ONE_OBJECTIVES,
  ...LEVEL_ONE_INTERACTIVES,
  ...LEVEL_ONE_FARM_OBJECTS,
  ...LEVEL_ONE_ANIMAL_OBJECTS
]);

export default LEVEL_ONE_VILLAGE_NIVRAYIM;
