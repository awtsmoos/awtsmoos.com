// B"H
/** Proves village activity is schedule-driven, persistent, UI-visible, and loop-free. */
import { resetLivingWorldState, loadLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';
import { loadWorldState } from '../../ckidsAwtsmoos/systems/worldState/WorldStateStore.js';
import { createLivingWorldRuntime } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js';
import { createVillageActivityScheduler } from '../../ckidsAwtsmoos/systems/village/VillageActivitySchedulerRuntime.js';
function assert(ok,msg){ if(!ok) throw new Error(msg); }
const memory = new Map();
globalThis.localStorage = { getItem:k => memory.get(k) || null, setItem:(k,v) => memory.set(k,String(v)), removeItem:k => memory.delete(k) };
globalThis.CustomEvent ||= class CustomEvent { constructor(type, init={}){ this.type=type; this.detail=init.detail; } };
globalThis.dispatchEvent ||= () => true;
resetLivingWorldState({});
const runtime = createLivingWorldRuntime(globalThis, { skipWorldStateHydration:true });
const phases = [runtime.villageHour(6,'audit-dawn'), runtime.villageHour(9,'audit-morning'), runtime.villageHour(14,'audit-afternoon'), runtime.villageHour(18,'audit-evening'), runtime.villageHour(22,'audit-night')];
assert(phases.map(p=>p.phase).join(',') === 'dawn,morning,afternoon,evening,night', 'all day phases should resolve in order');
assert(phases.every(p => p.assignments.length >= 5), 'each phase should assign all starter NPCs');
assert(phases.find(p=>p.phase==='morning').services.find(s=>s.id==='vendors').open, 'morning vendors should open');
assert(!phases.find(p=>p.phase==='night').services.find(s=>s.id==='vendors').open, 'night vendors should close');
assert(runtime.villageScheduler.state.hasLoop === false, 'scheduler must not own a frame loop');
runtime.step('audit-integrated-step', 14);
const living = loadLivingWorldState();
assert(living.uiPayloads.villageActivity.phase === 'afternoon', 'UI payload should persist latest village phase');
assert(Object.keys(living.npcSchedules).length >= 5, 'NPC schedules should persist');
assert((living.rumors||[]).some(r => String(r.topic).startsWith('phase_')), 'phase rumors should be generated');
assert((living.eventFeed||[]).some(e => e.domain === 'villageActivity'), 'village activity events should be in feed');
assert(living.servicesOpen.vendors === true, 'afternoon vendor service should be open');
assert(living.npcs.some(n => n.currentActivity?.phase === 'afternoon'), 'NPCs should carry current activity');
const direct = createVillageActivityScheduler(living, globalThis).advanceTo(22, 'direct-night');
assert(direct.phase === 'night', 'direct scheduler should also work');
const mirrored = loadWorldState();
assert(mirrored.livingWorld?.uiPayloads?.villageActivity?.phase, 'world-state mirror should include village activity payload');
console.log(JSON.stringify({ ok:true, phases:phases.map(p=>p.phase), latest:living.uiPayloads.villageActivity.phase, assignments:living.uiPayloads.villageActivity.assignments.length, services:living.servicesOpen, noLoop:runtime.villageScheduler.state.hasLoop === false }, null, 2));
