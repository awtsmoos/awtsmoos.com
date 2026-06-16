// B"H
import { VILLAGE_GRASS_PATCHES } from './LevelOneVillageConfig.js';

export const LEVEL_ONE_TERRAIN = Object.freeze([
  {
    id: 'level_one_living_ground',
    type: 'terrain',
    position: [0, 0, -25],
    props: {
      width: 190,
      depth: 190,
      dirtColor: 0x6a4b2b,
      grassColor: 0x2f8f47,
      shaderScale: 0.028,
      grassPatches: VILLAGE_GRASS_PATCHES,
      physics: { halfExtents: [95, 0.5, 95] },
      collider: 'static_ground',
      interaction: 'safe_starting_zone'
    }
  },
  { id: 'soft_grass_spawn_ring', type: 'grassPatch', position: [0, 0.04, -12], props: { w: 24, d: 18, interaction: 'visual_grass_safe_radius' } },
  { id: 'market_grass_path', type: 'grassPatch', position: [18, 0.04, -21], props: { w: 18, d: 10, interaction: 'visual_market_path' } }
]);
