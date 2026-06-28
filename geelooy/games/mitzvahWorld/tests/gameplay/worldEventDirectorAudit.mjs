// B"H
/** Proves the world event director creates contextual, persistent, loop-free story sparks. */
import { resetLivingWorldState, loadLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';
import { loadWorldState } from '../../ckidsAwtsmoos/systems/worldState/WorldStateStore.js';
import { createLivingWorldRuntime } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js';
import { createWorldEventDirectorRuntime } from '../../ckidsAwtsmoos/systems/world/WorldEventDirectorRuntime.js';
function assert(ok,msg){ if(!ok) throw new Error(msg); }
const memory = new Map();
globalThis.localStorage = { getItem:k => memory.get(k) || null, setItem:(k,v) => memory.set(k,String(v)), removeItem:k => memory.delete(k) };
globalThis.CustomEvent ||= class CustomEvent { constructor(type, init={}){ this.type=type; this.detail=init.detail; } };
globalThis.dispatchEvent ||= () => true;
resetLivingWorldState({ economy:{ bread:1, candle:2, demand:{ bread:5, candle:3, soup:2 }, prices:{ bread:5, candle:4, soup:3 } } });
const runtime = createLivingWorldRuntime(globalThis, { skipWorldStateHydration:true });
const village = runtime.villageHour(9, 'director-audit-morning');
assert(village.phase === 'morning', 'morning phase should be active');
const bread = runtime.directWorldEvent('director-audit-force', { forceId:'bread_shortage', phase:'morning' });
assert(bread.id === 'bread_shortage', 'forced bread shortage should fire');
assert(runtime.store.activeMissions.deliver_flour_for_bread_shortage, 'bread shortage mission hook should exist');
assert(runtime.store.uiPayloads.worldEventDirector.last.id === 'bread_shortage', 'UI payload should show director event');
assert(runtime.worldEventDirector.state.worldEventDirector.hasLoop === false, 'director must not own a loop');
runtime.step('director-integrated-afternoon', 14);
const living = loadLivingWorldState();
assert(living.worldEventDirector.pulses >= 2, 'director should pulse directly and through living-world step');
assert(living.uiPayloads.worldEventDirector.last.id, 'director UI payload should persist');
assert((living.eventFeed||[]).some(e => e.domain === 'worldEventDirector'), 'director event feed should persist');
assert((living.rumors||[]).some(r => ['bread_shortage','lost_child_letter','traveler_arrives'].includes(r.topic)), 'director rumors should persist');
const direct = createWorldEventDirectorRuntime(living, globalThis);
assert(direct.choose({ phase:'night' }).phase.includes('night'), 'direct chooser should resolve night event');
const world = loadWorldState();
assert(world.livingWorld?.worldEventDirector?.last?.id, 'world-state mirror should include director last event');
assert(world.livingWorld?.uiPayloads?.worldEventDirector?.last?.id, 'world-state mirror should include director UI payload');
console.log(JSON.stringify({ ok:true, first:bread.id, latest:living.uiPayloads.worldEventDirector.last.id, pulses:living.worldEventDirector.pulses, activeMissions:Object.keys(living.activeMissions), noLoop:runtime.worldEventDirector.state.worldEventDirector.hasLoop === false }, null, 2));
