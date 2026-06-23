// B"H
/** @file NpcInterestRuntimePolicy.js @description NPC mind/schedule/perception budgets for a living village at 60 FPS. */
import { masterRealismPolicy } from '../realism/MasterRealismPolicy.js';
export function npcInterestRuntimePolicy(budget = globalThis.__MITZVAH_WORLD_PERFORMANCE_BUDGET__) {
  const p = masterRealismPolicy(budget).npcs;
  return {
    ...p,
    perception: { near:p.nearHz, mid:p.midHz, far:p.farHz, horizon:0 },
    dialogue: 'event-driven-on-interaction',
    memory: 'write-on-event-read-on-interest',
    relationships: 'batch-low-frequency',
    pathfinding: 'spatial-hash-plus-budgeted-repath',
    schedules: '1hz-near-mid-statistical-far',
    forbidden: ['all-npc-every-frame-thinking', 'global-linear-awareness-scans']
  };
}
export default npcInterestRuntimePolicy;
