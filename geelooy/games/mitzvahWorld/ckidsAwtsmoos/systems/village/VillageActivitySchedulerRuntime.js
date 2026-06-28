// B"H
/**
 * VillageActivitySchedulerRuntime
 * Event-driven village life. Reality mutation and presentation now travel
 * through abstraction seams instead of ad-hoc helpers scattered through the day.
 */
import { phaseForHour, activityForNpc } from './VillageActivityScheduleRegistry.js';
import { addEventFeed, addMemory, addMovementIntent, addRumor, commitUiPayloads, saveLivingWorldState } from '../livingWorld/LivingWorldState.js';
import { createRumor } from '../npc/GossipRuntime.js';
import { applyEconomySignalToStore } from '../livingWorld/EconomyLivingRuntime.js';
import { capList, now } from '../core/WorldRealityAdapter.js';
import { publish, publishLivingWorld, publishUiPayload } from '../ui/WorldPresentationBus.js';

function serviceRows(phase) { return Object.entries(phase.services || {}).map(([id, open]) => ({ id, open:Boolean(open), phase:phase.id })); }
function applyNpc(store, npc, phase, reason) {
  const activity = activityForNpc(npc, phase);
  const from = npc.currentPlace || npc.home || 'home';
  const to = npc[activity.place] || activity.place || npc.workplace || npc.home || 'market_square';
  npc.currentRole = activity.verb;
  npc.currentPlace = to;
  npc.currentActivity = { ...activity, phase:phase.id, reason, at:now() };
  store.npcSchedules[npc.id] = { npcId:npc.id, phase:phase.id, role:activity.verb, place:to, hour:store.clockHour, updatedAt:now() };
  addMovementIntent(store, { npcId:npc.id, from, to, reason:`village-${phase.id}-${activity.verb}` });
  addMemory(store, npc.id, { kind:'village_activity', phase:phase.id, role:activity.verb, place:to, text:activity.line });
  return { npcId:npc.id, name:npc.name, role:activity.verb, place:to, line:activity.line };
}
export function createVillageActivityScheduler(store, scope = globalThis) {
  store.villageActivity ||= { phase:null, transitions:[], assignments:[], services:[], crowd:'low', mood:'quiet' };
  const state = { pulses:0, lastPhase:store.villageActivity.phase, lastPayload:null, hasLoop:false };
  function advanceTo(hour = store.clockHour || 6, reason = 'manual', options = {}) {
    const shouldPersist = options.persist !== false;
    const shouldEmit = options.emit !== false;
    store.clockHour = hour;
    const phase = phaseForHour(hour);
    const changed = state.lastPhase !== phase.id;
    state.pulses += 1;
    state.lastPhase = phase.id;
    const assignments = (store.npcs || []).map(npc => applyNpc(store, npc, phase, reason));
    const services = serviceRows(phase);
    const summary = { phase:phase.id, hour, mood:phase.mood, lighting:phase.lighting, sound:phase.sound, crowd:phase.crowd, services, assignments, changed, reason, pulse:state.pulses, at:now() };
    store.villageActivity = { ...summary, transitions:capList([...(store.villageActivity.transitions || []), summary], 24) };
    store.servicesOpen = Object.fromEntries(services.map(s => [s.id, s.open]));
    if (changed) addRumor(store, createRumor('village', `The village shifted into ${phase.id}.`, `phase_${phase.id}`));
    addEventFeed(store, { domain:'villageActivity', type:'phase', phase:phase.id, mood:phase.mood, reason, changed });
    applyEconomySignalToStore(store, 'village_activity', { action:'phase', phase:phase.id, crowd:phase.crowd, services:store.servicesOpen });
    commitUiPayloads(store);
    publishUiPayload(store, 'villageActivity', summary);
    state.lastPayload = summary;
    if (shouldPersist) saveLivingWorldState(store);
    if (shouldEmit) {
      publish(scope, 'mitzvah-world:village-activity', summary);
      publishLivingWorld(scope, 'village-activity', summary);
    }
    return { ...summary, saved:shouldPersist };
  }
  function snapshot() { return state.lastPayload || store.uiPayloads?.villageActivity || advanceTo(store.clockHour || 6, 'snapshot', { persist:false, emit:false }); }
  return { store, state, advanceTo, snapshot, services:() => serviceRows(phaseForHour(store.clockHour || 6)) };
}
export default createVillageActivityScheduler;
