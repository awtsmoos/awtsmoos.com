// B"H
/**
 * @file VillageDailyLifeRuntime.js
 * @description
 * Compatibility shim over NpcScheduleRuntime.
 *
 * This file used to carry a second miniature day table. That made a duplicate
 * scheduler shadow. Now it preserves the old exports while bowing to the active
 * schedule vessel, so existing callers do not break and no hidden second clock
 * is born.
 */
import { dailyRole as scheduleDailyRole, ensureNpcSchedule } from './NpcScheduleRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export const VILLAGE_DAILY_LIFE_OWNER = Object.freeze({
  owner:'NpcScheduleRuntime/VillageActivitySchedulerRuntime',
  supersededBy:'ckidsAwtsmoos/systems/village/VillageActivitySchedulerRuntime.js',
  compatibilitySource:'ckidsAwtsmoos/systems/npc/NpcScheduleRuntime.js',
  startsLoop:false,
  writesPersistence:false
});

export function dailyRole(hour = new Date().getHours(), context = {}) {
  return scheduleDailyRole(hour, context);
}

function normalizeNpc(npc = {}) {
  return { ...npc, id:npc.id || npc.npcId || 'villager' };
}

export function createVillageDailyLifeRuntime(npcs = [], scope = globalThis) {
  const normalized = npcs.map(normalizeNpc);
  return {
    owner:VILLAGE_DAILY_LIFE_OWNER,
    snapshot(hour = new Date().getHours(), context = {}) {
      return normalized.map(npc => {
        const schedule = ensureNpcSchedule(npc, hour, context);
        return { id:schedule.npcId, role:schedule.role, place:schedule.place, hour:schedule.hour };
      });
    },
    apply(hour = new Date().getHours(), context = {}) {
      const snap = this.snapshot(hour, context);
      scope.dispatchEvent?.(new CustomEvent('mitzvah-world:village-life', {
        detail:{ hour, snap, owner:VILLAGE_DAILY_LIFE_OWNER }
      }));
      return snap;
    }
  };
}

export default createVillageDailyLifeRuntime;
