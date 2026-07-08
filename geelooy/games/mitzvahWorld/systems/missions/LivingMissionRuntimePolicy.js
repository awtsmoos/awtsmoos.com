// B"H
/** @file LivingMissionRuntimePolicy.js @description Mission density that feels alive without per-frame quest scanning. */
import { masterRealismPolicy } from '../realism/MasterRealismPolicy.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
export function livingMissionRuntimePolicy(budget = globalThis.__MITZVAH_WORLD_PERFORMANCE_BUDGET__) {
  const p = masterRealismPolicy(budget).missions;
  return {
    ...p,
    missionFamilies: ['village-request', 'lost-animal', 'weather-disaster', 'crop-failure', 'escort', 'teaching', 'mitzvah-chain', 'travel-help', 'repair'],
    triggers: ['npc-memory-event', 'weather-state-change', 'player-region-enter', 'animal-missing', 'village-need-created'],
    scanRate: 'event-driven-only',
    rewards: ['reputation', 'relationship', 'learning-progress', 'tools', 'perutah'],
    capLaw: 'near-player-active-cap-far-world-statistical-story-thread'
  };
}
export default livingMissionRuntimePolicy;
