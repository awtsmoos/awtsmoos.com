// B"H
/**
 * VillageActivitySchedulerRuntime
 * One authority for village life. It advances only on explicit pulses, assigns
 * NPC activities, writes bounded memories/rumors/events, and exposes UI data.
 */
import { phaseForHour, activityForNpc } from './VillageActivityScheduleRegistry.js';
import { addEventFeed, addMemory, addMovementIntent, addRumor, commitUiPayloads, saveLivingWorldState } from '../livingWorld/LivingWorldState.js';
import { createRumor } from '../npc/GossipRuntime.js';
import { applyEconomySignal } from '../livingWorld/EconomyLivingRuntime.js';

function Custom(type, detail) { const Ctor = globalThis.CustomEvent; return Ctor ? new Ctor(type, { detail }) : { type, detail }; }
function cap(list = [], n = 40) { return list.slice(-n); }
function serviceRows(phase) { return Object.entries(phase.services || {}).map(([id, open]) => ({ id, open:Boolean(open), phase:phase.id })); }
function applyNpc(store, npc, phase, reason) {
  const activity = activityForNpc(npc, phase);
  const from = npc.currentPlace || npc.home || 'home';
  const to = npc[activity.place] || activity.place || npc.workplace || npc.home || 'market_square';
  npc.currentRole = activity.verb;
  npc.currentPlace = to;
  npc.currentActivity = { ...activity, phase:phase.id, reason, at:Date.now() };
  store.npcSchedules[npc.id] = { npcId:npc.id, phase:phase.id, role:activity.verb, place:to, hour:store.clockHour, updatedAt:Date.now() };
  addMovementIntent(store, { npcId:npc.id, from, to, reason:`village-${phase.id}-${activity.verb}` });
  addMemory(store, npc.id, { kind:'village_activity', phase:phase.id, role:activity.verb, place:to, text:activity.line });
  return { npcId:npc.id, name:npc.name, role:activity.verb, place:to, line:activity.line };
}
export function createVillageActivityScheduler(store, scope = globalThis) {
  store.villageActivity ||= { phase:null, transitions:[], assignments:[], services:[], crowd:'low', mood:'quiet' };
  const state = { pulses:0, lastPhase:store.villageActivity.phase, lastPayload:null, hasLoop:false };
  function advanceTo(hour = store.clockHour || 6, reason = 'manual') {
    store.clockHour = hour;
    const phase = phaseForHour(hour);
    const changed = state.lastPhase !== phase.id;
    state.pulses += 1;
    state.lastPhase = phase.id;
    const assignments = (store.npcs || []).map(npc => applyNpc(store, npc, phase, reason));
    const services = serviceRows(phase);
    const summary = { phase:phase.id, hour, mood:phase.mood, lighting:phase.lighting, sound:phase.sound, crowd:phase.crowd, services, assignments, changed, reason, pulse:state.pulses, at:Date.now() };
    store.villageActivity = { ...summary, transitions:cap([...(store.villageActivity.transitions || []), summary], 24) };
    store.servicesOpen = Object.fromEntries(services.map(s => [s.id, s.open]));
    if (changed) addRumor(store, createRumor('village', `The village shifted into ${phase.id}.`, `phase_${phase.id}`));
    addEventFeed(store, { domain:'villageActivity', type:'phase', phase:phase.id, mood:phase.mood, reason, changed });
    applyEconomySignal('village_activity', { action:'phase', phase:phase.id, crowd:phase.crowd, services:store.servicesOpen });
    commitUiPayloads(store);
    store.uiPayloads.villageActivity = summary;
    const saved = saveLivingWorldState(store);
    state.lastPayload = summary;
    scope.dispatchEvent?.(Custom('mitzvah-world:village-activity', summary));
    scope.dispatchEvent?.(Custom('mitzvah-world:living-world', { type:'village-activity', payload:summary }));
    return { ...summary, saved:Boolean(saved) };
  }
  function snapshot() { return state.lastPayload || store.uiPayloads?.villageActivity || advanceTo(store.clockHour || 6, 'snapshot'); }
  return { store, state, advanceTo, snapshot, services:() => serviceRows(phaseForHour(store.clockHour || 6)) };
}
export default createVillageActivityScheduler;
