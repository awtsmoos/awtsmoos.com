// B"H
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { createFakeDom } from '../headless/FakeDom.js';
import { resetLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';
import { createLivingWorldRuntime } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js';
import { installLivingWorldVisibleBridge } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldVisibleBridge.js';
import { installLivingWorldUiPulse } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldUiPulse.js';
import { trainAbilityAtTrainer } from '../../ckidsAwtsmoos/systems/trainers/TrainerRuntime.js';
import { trainProfession } from '../../ckidsAwtsmoos/systems/professions/ProfessionTrainingRuntime.js';
import { applyResourceRespawn } from '../../ckidsAwtsmoos/systems/world/ResourceRespawnRuntime.js';
import { advanceQuestChain, questChainStatus } from '../../ckidsAwtsmoos/systems/missions/QuestChainRuntime.js';
import { applyShefaAction } from '../../ckidsAwtsmoos/systems/shefa/ShefaRuntime.js';
import { applyHashgacha } from '../../ckidsAwtsmoos/systems/hashgacha/HashgachaRuntime.js';
import { composeAmbientConversation } from '../../ckidsAwtsmoos/systems/dialog/AmbientConversationRuntime.js';
import { saveWorldState, loadWorldState } from '../../ckidsAwtsmoos/systems/worldState/WorldStateStore.js';

function defineGlobal(name, value) { Object.defineProperty(globalThis, name, { value, configurable:true, writable:true }); }
function installStorage() { const box = new Map(); return { getItem:k=>box.has(k)?box.get(k):null, setItem:(k,v)=>box.set(k,String(v)), removeItem:k=>box.delete(k), clear:()=>box.clear() }; }
function clock() { let t = 1000; return { now:() => t, requestAnimationFrame:fn => { t += 16; return setTimeout(() => fn(t), 0); }, cancelAnimationFrame:id => clearTimeout(id), advance:ms => { t += ms; } }; }
function addEvents(win) { const target = new EventTarget(); win.addEventListener = target.addEventListener.bind(target); win.removeEventListener = target.removeEventListener.bind(target); win.dispatchEvent = target.dispatchEvent.bind(target); }
function installUiBridge(win, document) {
  const panel = document.register('livingWorldPanel');
  const events = [];
  win.__MITZVAH_UI_BRIDGE__ = { receive(name, payload) { events.push({ name, payload }); panel.lastName = name; panel.lastPayload = payload; panel.textContent = JSON.stringify(payload); return true; } };
  return { panel, events };
}

const fakeClock = clock();
const { window, document } = createFakeDom(fakeClock);
addEvents(window);
defineGlobal('window', window);
defineGlobal('document', document);
defineGlobal('navigator', window.navigator);
defineGlobal('localStorage', installStorage());
defineGlobal('CustomEvent', globalThis.CustomEvent);
defineGlobal('EventTarget', globalThis.EventTarget);
window.localStorage = globalThis.localStorage;
saveWorldState({});
const ui = installUiBridge(window, document);
const store = resetLivingWorldState({ economy:{ flour:2, bread:3, wax:1, charity:1, grain:0, wood:0, paper:0, ink:0, demand:{ bread:5, candle:3, soup:2 }, prices:{ bread:5, candle:4, soup:3 } }, reputation:{ village:5, virtues:{} } });
window.__MITZVAH_WORLD_REALISM_BUDGET__ = { scheduler:{ maxTasksPerTick:3 } };
const runtime = createLivingWorldRuntime(window, { store, skipWorldStateHydration:true }).start('node-dom-sim');
window.__MITZVAH_WORLD_LIVING_WORLD__ = runtime;
const firstVisible = installLivingWorldVisibleBridge(window);
const pulseSummary = installLivingWorldUiPulse(window, { minIntervalMs:250, reason:'node-dom-sim' });
const olam = { player:{ level:8, perutah:40, maxKoach:100, koach:100, inventory:{ slots:[], actionSlots:[], equipment:{} } }, ayshPeula:(kind, name, payload) => window.__MITZVAH_UI_BRIDGE__.receive(name || kind, payload) };
const trainedAbility = trainAbilityAtTrainer(olam, 'learner', { slot:1, silent:true });
const profession = trainProfession(runtime.store, 'baker');
const crafted = runtime.professions.craft('challah', 'player', { requireTraining:true });
const purchase = runtime.buyVendorItem({ id:'warm_bread', price:5 }, { player:olam.player, price:5, vendorId:'bakery' });
const resources = applyResourceRespawn(runtime.store, 10);
const chain1 = advanceQuestChain(runtime.store, 'bakery_kindness');
const chain2 = advanceQuestChain(runtime.store, 'bakery_kindness');
const shefa = applyShefaAction(runtime.store, 'tzedakah', 3);
const hashgacha = applyHashgacha(runtime.store, 'node-dom-sim');
const ambient = composeAmbientConversation(runtime.store, 'miriam_baker', 'tova_child');
runtime.step('node-dom-sim-1', 9);
runtime.step('node-dom-sim-2', 10);
window.dispatchEvent(new CustomEvent('awtsmoos:worker-gameplay-fps', { detail:{ reason:'node-dom-worker-fps' } }));
fakeClock.advance(300);
window.dispatchEvent(new CustomEvent('awtsmoos:worker-gameplay-fps', { detail:{ reason:'node-dom-worker-fps-2' } }));
const finalPayload = window.__MITZVAH_RENDER_LIVING_WORLD__();
const report = { ok:true, visiblePayloadReceived:ui.events.length, panelName:ui.panel.lastName, firstVisible, pulseSummary:window.__MITZVAH_LIVING_WORLD_UI_PULSE_SUMMARY__(), trainedAbility:{ ok:trainedAbility.ok, perutah:trainedAbility.perutah, rank:trainedAbility.trainerState?.abilityRanks?.shemaUnity }, profession, crafted, purchase, resources, chain:questChainStatus(runtime.store, 'bakery_kindness'), chain1, chain2, shefa:{ malchus:shefa.malchus, chesed:shefa.chesed }, hashgacha, ambient, finalPayload, worldState:loadWorldState().livingWorld };
assert.ok(firstVisible.questTracker.active.length >= 1, 'visible bridge produces quest rows');
assert.ok(ui.events.some(e => e.name === 'livingWorldVisible'), 'UI bridge receives livingWorldVisible');
assert.equal(ui.panel.lastName, 'livingWorldVisible', 'fake DOM panel stores latest visible payload');
assert.equal(trainedAbility.ok, true, 'trainer works in node-dom session');
assert.ok(olam.player.spellbook.learned.shemaUnity, 'spellbook updated in node-dom session');
assert.ok(profession.learnedRecipes.includes('challah'), 'profession trainer unlocks challah');
assert.ok(crafted?.recipeId === 'challah', 'trained profession craft succeeds');
assert.equal(purchase.ok, true, 'wallet vendor purchase succeeds');
assert.equal(olam.player.perutah, 29, 'trainer plus vendor purchase charged wallet');
assert.ok(resources.gains.flour >= 0, 'resource respawn ran');
assert.equal(report.chain.activeNode, 'feed_guest', 'quest chain advanced two nodes');
assert.ok(report.shefa.malchus > 0, 'shefa manifests');
assert.ok(runtime.store.hashgachaEvents?.length >= 1, 'hashgacha event recorded');
assert.ok(runtime.store.ambientConversations?.length >= 1, 'ambient conversation recorded');
assert.ok(finalPayload.ambientFeed.events.length >= 1, 'final visible payload includes ambient feed');
assert.ok(report.worldState?.economyTransactions?.length >= 1, 'world-state persistence includes vendor transaction');
await writeFile('tests/headless/lastNodeDomLivingWorldGameplaySimulation.json', JSON.stringify(report, null, 2));
console.log('nodeDomLivingWorldGameplaySimulationSmoke passed');
