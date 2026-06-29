// B"H
/** Realistic behavior polish audit: verifies existing realism surfaces and documents missing beverage support. */
import fs from 'node:fs';
import { resetLivingWorldState, loadLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';
import { createLivingWorldRuntime } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js';
import { openNpcInteraction } from '../../ckidsAwtsmoos/systems/npc/NpcInteractionRuntime.js';
function assert(ok, msg) { if (!ok) throw new Error(msg); }
const memory = new Map();
globalThis.localStorage = { getItem:k => memory.get(k) || null, setItem:(k,v) => memory.set(k,String(v)), removeItem:k => memory.delete(k) };
globalThis.CustomEvent ||= class CustomEvent { constructor(type, init={}) { this.type = type; this.detail = init.detail; } };
globalThis.dispatchEvent ||= () => true;
resetLivingWorldState({});
const runtime = createLivingWorldRuntime(globalThis, { skipWorldStateHydration:true });
const morning = runtime.villageHour(9, 'realism-morning');
const afternoon = runtime.villageHour(14, 'realism-afternoon');
const npc = runtime.store.npcs.find(n => n.id === 'miriam_baker');
const dialogue = openNpcInteraction('miriam_baker', { store:runtime.store, place:npc.currentPlace }, runtime.store.npcs);
const sourceBlob = [
  'ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js',
  'ckidsAwtsmoos/systems/professions/ProfessionRuntime.js',
  'ckidsAwtsmoos/systems/social/VendorStockRegistry.js',
  'ckidsAwtsmoos/systems/economy/EconomyPricingRuntime.js'
].filter(fs.existsSync).map(f => fs.readFileSync(f,'utf8')).join('\n').toLowerCase();
const beverageWords = ['water','drink','juice','tea','wine','milk','beverage','cup'];
const beverageHits = beverageWords.filter(w => sourceBlob.includes(w));
assert(morning.services.find(s => s.id === 'vendors').open === true, 'morning vendors should be open');
assert(afternoon.assignments.some(a => a.npcId === 'miriam_baker' && a.place), 'afternoon should assign Miriam to a real place');
assert(npc.currentActivity?.phase === 'afternoon', 'NPC should carry current phase activity');
assert(dialogue.greeting, 'dialogue should produce greeting');
const saved = loadLivingWorldState();
assert(saved.uiPayloads.villageActivity.phase === 'afternoon', 'village activity should be visible in UI payload');
const result = { ok:true, behavior:{ morningVendorsOpen:true, npcCurrentActivity:npc.currentActivity, dialogueGreeting:dialogue.greeting, uiPhase:saved.uiPayloads.villageActivity.phase }, beverageAudit:{ supportedByExistingData:beverageHits.length > 0, hits:beverageHits, conclusion:beverageHits.length ? 'existing code mentions beverage-like resources' : 'no clear existing beverage/drink resource support found; do not invent new beverage systems without design approval' } };
fs.mkdirSync('AI_THOUGHTS/realism_reports', { recursive:true });
fs.writeFileSync('AI_THOUGHTS/realism_reports/latest_realistic_behavior_polish_audit.json', JSON.stringify(result,null,2));
console.log(JSON.stringify(result, null, 2));
