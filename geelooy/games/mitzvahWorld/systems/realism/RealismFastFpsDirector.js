// B"H
/**
 * @file RealismFastFpsDirector.js
 * One living director gathers every domain covenant so realism and speed are not
 * enemies but two hands of the same Awtsmoos revelation.
 */
import { masterRealismPolicy } from './MasterRealismPolicy.js';
import { makeInterestTierScheduler } from './InterestTierScheduler.js';
import { animalHyperrealRuntimePolicy } from '../animals/AnimalHyperrealRuntimePolicy.js';
import { terrainRealismRuntimePolicy } from '../terrain/TerrainRealismRuntimePolicy.js';
import { npcInterestRuntimePolicy } from '../npc/NpcInterestRuntimePolicy.js';
import { treeAuthorityRuntimePolicy } from '../foliage/TreeAuthorityRuntimePolicy.js';
import { villageRealismRuntimePolicy } from '../buildings/VillageRealismRuntimePolicy.js';
import { livingMissionRuntimePolicy } from '../missions/LivingMissionRuntimePolicy.js';
import { ancientJewishUiRuntimePolicy } from '../ui/AncientJewishUiRuntimePolicy.js';

export function createRealismFastFpsDirector(scope = globalThis) {
  const state = { at:0, policy:null, scheduler:null, reports:[] };
  function rebuild() {
    const budget = scope.__MITZVAH_WORLD_PERFORMANCE_BUDGET__;
    const master = masterRealismPolicy(budget);
    const policy = {
      master,
      animals: animalHyperrealRuntimePolicy(budget),
      terrain: terrainRealismRuntimePolicy(budget),
      npcs: npcInterestRuntimePolicy(budget),
      trees: treeAuthorityRuntimePolicy(budget),
      villages: villageRealismRuntimePolicy(budget),
      missions: livingMissionRuntimePolicy(budget),
      ui: ancientJewishUiRuntimePolicy(budget)
    };
    state.at = Date.now();
    state.policy = policy;
    state.scheduler = makeInterestTierScheduler({ ...policy.npcs.perception, nearDistance:70, midDistance:180, farDistance:420 });
    scope.__MITZVAH_MASTER_REALISM_POLICY__ = policy;
    scope.dispatchEvent?.(new CustomEvent('mitzvah-world:master-realism-policy', { detail:{ policy } }));
    return policy;
  }
  function report(note = {}) {
    const entry = { at:Date.now(), note, tier:state.policy?.master?.tier || 'unknown' };
    state.reports.push(entry);
    state.reports = state.reports.slice(-30);
    return { ...entry, policy:state.policy };
  }
  return { state, rebuild, report };
}
export default createRealismFastFpsDirector;
