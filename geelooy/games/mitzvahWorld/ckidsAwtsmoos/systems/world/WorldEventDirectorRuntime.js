// B"H
/**
 * WorldEventDirectorRuntime
 * Story sparks now pass through Reality and Presentation seams. The director is
 * still explicit-pulse only: no loop, no frame tax, no hidden rendering tie.
 */
import { WORLD_EVENT_DIRECTOR_EVENTS, eventAllowed, eventMatchesPhase } from './WorldEventDirectorRegistry.js';
import { addEventFeed, addMemory, addRumor, commitUiPayloads, saveLivingWorldState } from '../livingWorld/LivingWorldState.js';
import { persistLivingWorldToWorldState } from '../livingWorld/LivingWorldPersistenceBridge.js';
import { createRumor } from '../npc/GossipRuntime.js';
import { capList, now } from '../core/WorldRealityAdapter.js';
import { publish, publishLivingWorld, publishUiPayload } from '../ui/WorldPresentationBus.js';

function phaseOf(state = {}) { return state.villageActivity?.phase || state.uiPayloads?.villageActivity?.phase || 'morning'; }
function seenRecently(state, id) { return (state.worldEventDirector?.recent || []).includes(id); }
function score(event, state) { return Number(event.priority || 0) + (eventAllowed(event, state) ? 100 : -999) - (seenRecently(state, event.id) ? 80 : 0); }
function choose(state, options = {}) {
  if (options.forceId) return WORLD_EVENT_DIRECTOR_EVENTS.find(e => e.id === options.forceId) || null;
  const phase = options.phase || phaseOf(state);
  return WORLD_EVENT_DIRECTOR_EVENTS.filter(e => eventMatchesPhase(e, phase)).sort((a,b) => score(b,state) - score(a,state))[0] || null;
}
function applyEffects(state, event) {
  state.economy ||= {}; state.economy.demand ||= {}; state.reputation ||= { virtues:{} }; state.villageProjects ||= {};
  for (const [k,v] of Object.entries(event.effects?.economy || {})) state.economy[k] = Math.max(0, Number(state.economy[k] || 0) + Number(v || 0));
  for (const [k,v] of Object.entries(event.effects?.economyDemand || {})) state.economy.demand[k] = Math.max(0, Number(state.economy.demand[k] || 0) + Number(v || 0));
  for (const [k,v] of Object.entries(event.effects?.reputation || {})) state.reputation[k] = Number(state.reputation[k] || 0) + Number(v || 0);
  for (const [k,v] of Object.entries(event.effects?.project || {})) state.villageProjects[k] = Math.max(0, Number(state.villageProjects[k] || 0) + Number(v || 0));
}
function acceptMissionHook(state, hook, event) {
  if (!hook) return null;
  state.activeMissions ||= {};
  state.activeMissions[hook] ||= { id:hook, title:event.ui, source:'world-event-director', place:event.place, sourceNpc:event.npc, objectives:[{ kind:'respond_to_event', target:event.id, current:0, needed:1 }] };
  return state.activeMissions[hook];
}
export function createWorldEventDirectorRuntime(state, scope = globalThis) {
  state.worldEventDirector ||= { recent:[], events:[], last:null, pulses:0, hasLoop:false };
  const local = { hasLoop:false };
  function pulse(reason = 'manual', options = {}) {
    const shouldPersist = options.persist !== false;
    const shouldEmit = options.emit !== false;
    const event = choose(state, options);
    if (!event) return null;
    const phase = options.phase || phaseOf(state);
    applyEffects(state, event);
    const mission = acceptMissionHook(state, event.missionHook, event);
    const rumor = addRumor(state, createRumor(event.npc || 'village', event.rumor, event.id));
    addMemory(state, event.npc || 'village', { kind:'world_event_director', eventId:event.id, phase, place:event.place, text:event.ui });
    const row = { id:event.id, phase, place:event.place, npc:event.npc, ui:event.ui, missionId:mission?.id || null, rumorId:rumor.id, reason, at:now() };
    state.worldEventDirector.pulses += 1;
    state.worldEventDirector.last = row;
    state.worldEventDirector.recent = capList([...(state.worldEventDirector.recent || []), event.id], 6);
    state.worldEventDirector.events = capList([...(state.worldEventDirector.events || []), row], 30);
    addEventFeed(state, { domain:'worldEventDirector', type:event.id, phase, place:event.place, missionId:row.missionId, reason });
    commitUiPayloads(state);
    publishUiPayload(state, 'worldEventDirector', { last:row, recent:state.worldEventDirector.events.slice(-5), pulse:state.worldEventDirector.pulses, hasLoop:false });
    if (shouldPersist) {
      const saved = saveLivingWorldState(state);
      persistLivingWorldToWorldState(saved, { reason:`world-event-director:${event.id}` });
    }
    if (shouldEmit) {
      publish(scope, 'mitzvah-world:world-event-director', row);
      publishLivingWorld(scope, 'world-event-director', row);
    }
    return row;
  }
  function snapshot() { return { ...(state.worldEventDirector || {}), hasLoop:false, last:state.worldEventDirector?.last || null }; }
  return { state, local, pulse, snapshot, choose:(options={}) => choose(state, options), events:WORLD_EVENT_DIRECTOR_EVENTS };
}
export default createWorldEventDirectorRuntime;
