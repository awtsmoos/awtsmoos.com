// B"H
import assert from 'node:assert/strict';
import { createNpcMemoryRuntime } from '../../ckidsAwtsmoos/systems/npc/NpcMemoryRuntime.js';
import { applyApology, familyTrustSummary } from '../../ckidsAwtsmoos/systems/social/SocialConsequenceRuntime.js';
import { resetLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';
import { persistLivingWorldToWorldState, livingWorldPersistenceSummary } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldPersistenceBridge.js';
import { saveWorldState, loadWorldState } from '../../ckidsAwtsmoos/systems/worldState/WorldStateStore.js';

const box = new Map();
globalThis.localStorage = { getItem:k=>box.get(k)||null, setItem:(k,v)=>box.set(k,String(v)), removeItem:k=>box.delete(k), clear:()=>box.clear() };
globalThis.localStorage.clear();
saveWorldState({});
const store = resetLivingWorldState();
const memory = createNpcMemoryRuntime(store);
memory.remember('miriam_baker', { kind:'helped', text:'The player helped Miriam.' });
assert.ok(store.familyTrust.tova_child > 0, 'child gains trust from kindness to mother');
memory.remember('miriam_baker', { kind:'harmed', text:'The player harmed Miriam.' });
assert.ok(store.familyTrust.tova_child < 0, 'child loses trust from harm to mother');
const before = store.familyTrust.tova_child;
const apology = applyApology(store, 'miriam_baker', { repair:2 });
assert.ok(apology.repaired.includes('tova_child'), 'apology repairs family member');
assert.ok(store.familyTrust.tova_child > before, 'apology improves family trust');
persistLivingWorldToWorldState(store, { reason:'family-social-smoke' });
const summary = livingWorldPersistenceSummary(loadWorldState());
assert.ok(summary.familyTrust > 0, 'family trust mirrored into world state');
assert.ok(summary.socialConsequences > 0, 'social consequences mirrored into world state');
assert.ok(summary.apologies > 0, 'apologies mirrored into world state');
assert.ok(familyTrustSummary(store).tova_child !== undefined, 'family summary exposes child trust');
console.log('familySocialConsequenceSmoke passed');
