// B"H
import { VILLAGE_GRASS_PATCHES } from './LevelOneVillageConfig.js';

export const LEVEL_ONE_TERRAIN = Object.freeze([
  {
    id: 'level_one_living_ground',
    type: 'terrain',
    position: [0, 0, -25],
    props: {
      width: 180,
      depth: 180,
      dirtColor: 0x6a4b2b,
      grassColor: 0x2f8f47,
      shaderScale: 0.035,
      grassPatches: VILLAGE_GRASS_PATCHES,
      physics: { halfExtents: [90, 0.5, 90] }
    }
  }
]);
