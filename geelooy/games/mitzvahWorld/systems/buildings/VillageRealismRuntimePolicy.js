// B"H
/** @file VillageRealismRuntimePolicy.js @description Houses and villages become richer through merged kits, instancing, and wear masks. */
import { masterRealismPolicy } from '../realism/MasterRealismPolicy.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
export function villageRealismRuntimePolicy(budget = globalThis.__MITZVAH_WORLD_PERFORMANCE_BUDGET__) {
  const p = masterRealismPolicy(budget).villages;
  return {
    ...p,
    houseKit: ['foundation-stones', 'roof-overhang', 'chimney', 'trim', 'frames', 'beams', 'supports', 'shutters', 'porch', 'wear-mask'],
    settlementStyles: ['desert-stone', 'galil-wood-stone', 'market-courtyard', 'study-village'],
    drawCallLaw: 'merged-house-shell-plus-instanced-props',
    materialLaw: 'shared-plaster-roof-wood-stone-atlas',
    growthEvents: ['new-family', 'repaired-wall', 'market-day', 'school-expanded'],
    noFrameLoopWork: true
  };
}
export default villageRealismRuntimePolicy;
