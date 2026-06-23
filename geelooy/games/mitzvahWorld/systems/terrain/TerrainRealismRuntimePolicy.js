// B"H
/** @file TerrainRealismRuntimePolicy.js @description Terrain realism maps that stay cheap until chunks need revelation. */
import { masterRealismPolicy } from '../realism/MasterRealismPolicy.js';
export function terrainRealismRuntimePolicy(budget = globalThis.__MITZVAH_WORLD_PERFORMANCE_BUDGET__) {
  const p = masterRealismPolicy(budget).terrain;
  return {
    ...p,
    layers: ['height', 'slope', 'erosion', 'deposition', 'soil', 'rock', 'wetness', 'runoff', 'footpath', 'animalTrail', 'villageWear'],
    chunkWork: budget?.tier === 'survival' ? 'idle-only' : 'budgeted-async',
    textureBlendInputs: ['slope', 'wetness', 'soil', 'rock', 'wear'],
    noFrameLoopWork: true,
    updateTriggers: ['chunk-created', 'rain-ended', 'npc-route-committed', 'animal-herd-path', 'village-growth-event']
  };
}
export default terrainRealismRuntimePolicy;
