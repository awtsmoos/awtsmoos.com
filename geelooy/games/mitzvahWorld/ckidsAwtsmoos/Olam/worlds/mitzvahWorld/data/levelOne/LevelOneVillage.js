// B"H
import { LEVEL_ONE_TERRAIN } from './LevelOneTerrain.js';
import { LEVEL_ONE_BUILDINGS } from './LevelOneBuildings.js';
import { LEVEL_ONE_NPCS } from './LevelOneNpcs.js';
import { LEVEL_ONE_LANDMARKS } from './LevelOneLandmarks.js';
import { LEVEL_ONE_OBJECTIVES } from './LevelOneObjectives.js';

export const LEVEL_ONE_VILLAGE_NIVRAYIM = Object.freeze([
  ...LEVEL_ONE_TERRAIN,
  ...LEVEL_ONE_BUILDINGS,
  ...LEVEL_ONE_LANDMARKS,
  ...LEVEL_ONE_NPCS,
  ...LEVEL_ONE_OBJECTIVES
]);

export default LEVEL_ONE_VILLAGE_NIVRAYIM;
