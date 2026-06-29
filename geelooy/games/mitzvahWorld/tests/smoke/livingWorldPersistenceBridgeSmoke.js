// B"H
import assert from 'node:assert/strict';
import { resetLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';
import { createLivingWorldRuntime } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js';
import { loadWorldState, saveWorldState } from '../../ckidsAwtsmoos/systems/worldState/WorldStateStore.js';
import { hydrateLivingWorldFromWorldState, livingWorldPersistenceSummary } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldPersistenceBridge.js';

const memoryStorage = new Map();
globalThis.localStorage = {
  getItem(key) { return memoryStorage.has(key) ? memoryStorage.get(key) : null; },
  setItem(key, value) { memoryStorage.set(key, String(value)); },
  removeItem(key) { memoryStorage.delete(key); },
  clear() { memoryStorage.clear(); }
};

globalThis.localStorage.clear();
resetLivingWorldState();
saveWorldState({});
const rt = createLivingWorldRuntime(globalThis, { skipWorldStateHydration:true }).start('persistence-smoke');
rt.step('persistence-smoke', 8);
rt.remember('miriam_baker', { kind:'helped', text:'Persistence smoke kindness.' });
const mirrored = loadWorldState().livingWorld;
assert.ok(mirrored, 'world state must contain livingWorld slice');
assert.ok(Object.keys(mirrored.activeMissions || {}).length > 0, 'active missions mirrored');
assert.ok((mirrored.rumors || []).length > 0, 'rumors mirrored');
assert.ok(mirrored.reputation?.village >= 1, 'reputation mirrored');
assert.ok(mirrored.economy?.bread >= 0, 'economy mirrored');
assert.ok((mirrored.eventFeed || []).length > 0, 'event feed mirrored');
assert.ok(mirrored.updatedAt > 0, 'updatedAt mirrored');
const summary = livingWorldPersistenceSummary(loadWorldState());
assert.equal(summary.exists, true, 'summary sees bridge slice');
assert.ok(summary.activeMissions > 0, 'summary counts missions');
resetLivingWorldState({ activeMissions:{}, rumors:[], reputation:{ village:0, virtues:{} }, economy:{ bread:0 } });
const hydrated = hydrateLivingWorldFromWorldState({ activeMissions:{}, rumors:[] }, loadWorldState());
assert.ok(Object.keys(hydrated.activeMissions || {}).length > 0, 'hydrate restores active missions');
assert.ok((hydrated.rumors || []).length > 0, 'hydrate restores rumors');
const rt2 = createLivingWorldRuntime({ __MITZVAH_WORLD_STATE__:{ activeMissions:{}, rumors:[] } });
assert.ok(Object.keys(rt2.store.activeMissions || {}).length > 0, 'runtime hydrates from world-state bridge');
console.log('livingWorldPersistenceBridgeSmoke passed');
