// B"H
import { VILLAGE_GRASS_PATCHES } from './LevelOneVillageConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/** Level-one terrain: Chai textured ground with visible but budgeted grass blades. */
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
  { id: 'soft_grass_spawn_ring', type: 'grassPatch', position: [0, 0.04, -12], props: { radius: 16, count: 420, seed: 771, interaction: 'visual_grass_safe_radius', chaiBudgeted:true } },
  { id: 'market_grass_path', type: 'grassPatch', position: [18, 0.04, -21], props: { radius: 10, count: 210, seed: 772, interaction: 'visual_market_path', chaiBudgeted:true } }
]);
