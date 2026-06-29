// B"H
/**
 * StarterGameplaySimulationRuntime
 * A headless shliach walks the first path without a human clicking: movement,
 * NPC, delivery, trainer, profession, combat signal, and hearth. It uses the
 * same event bridge as gameplay, so the test proves the integration surface.
 */
import { resetLivingWorldState, loadLivingWorldState } from '../livingWorld/LivingWorldState.js';
import { ensureStarterExperience } from './StartingExperienceRuntime.js';
import { installStarterSignalBridge } from './StarterSignalBridge.js';
import { openNpcInteraction } from '../npc/NpcInteractionRuntime.js';
import { performDelivery } from '../missions/DeliveryRuntime.js';
import { createTrainerRuntime } from '../trainers/TrainerRuntime.js';
import { trainProfession } from '../professions/ProfessionTrainingRuntime.js';
import { craftItem } from '../professions/ProfessionRuntime.js';
import { bindHearth } from '../social/HearthRuntime.js';

function baseScope() {
  return typeof globalThis !== 'undefined' ? globalThis : {};
}
function ensureEvents(scope) {
  const events = [];
  const listeners = new Map();
  scope.CustomEvent ||= class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } };
  scope.addEventListener ||= (type, fn) => listeners.set(type, [...(listeners.get(type) || []), fn]);
  scope.removeEventListener ||= (type, fn) => listeners.set(type, (listeners.get(type) || []).filter(x => x !== fn));
  scope.dispatchEvent ||= event => { events.push(event); (listeners.get(event.type) || []).forEach(fn => fn(event)); return true; };
  return events;
}
export async function simulateStarterGameplay(options = {}) {
  const scope = options.scope || baseScope();
  const events = ensureEvents(scope);
  if (options.reset !== false) {
    resetLivingWorldState({});
    scope.__MITZVAH_STARTER_SIGNAL_BRIDGE__?.dispose?.();
    if (scope !== globalThis) globalThis.__MITZVAH_STARTER_SIGNAL_BRIDGE__?.dispose?.();
    delete scope.__MITZVAH_STARTER_SIGNAL_BRIDGE__;
    if (scope !== globalThis) delete globalThis.__MITZVAH_STARTER_SIGNAL_BRIDGE__;
    delete scope.__MITZVAH_STARTER_EXPERIENCE__;
    if (scope !== globalThis) delete globalThis.__MITZVAH_STARTER_EXPERIENCE__;
  }
  const store = loadLivingWorldState();
  store.economy.flour = Math.max(1, Number(store.economy?.flour || 0));
  store.economy.grain = Math.max(3, Number(store.economy?.grain || 0));
  store.__deferStarterPersistence = options.deferPersistence !== false;
  scope.__MITZVAH_WORLD_STATE__ = store;
  const runtime = ensureStarterExperience(scope);
  const bridge = installStarterSignalBridge(scope, runtime);
  runtime.start('simulated-full-gameplay');
  bridge.emit('movement', { position:{ x:-4, y:0, z:-9 }, reason:'walk-to-study-courtyard' });
  const npc = openNpcInteraction('miriam_baker', { store, place:'bakery' }, store.npcs || []);
  performDelivery('deliver_bread', 'elder_home');
  const trained = createTrainerRuntime(store).train('helper');
  const profession = trainProfession(store, 'baker');
  const crafted = craftItem(store, 'challah', 'player');
  bridge.emit('combat', { target:'courtyard_disturbance', result:{ ok:true, calm:true } });
  const hearth = bindHearth({ id:'village_inn', x:4, y:0, z:-6 });
  if (options.flushPersistence !== false) runtime.flushDeferred?.('simulated-full-gameplay-complete');
  const snapshot = runtime.snapshot();
  return { ok:snapshot.progress.done === snapshot.progress.total, snapshot, signals:{ ...bridge.counts }, npc, trained, profession, crafted, hearth, events:events.length };
}
export default simulateStarterGameplay;
