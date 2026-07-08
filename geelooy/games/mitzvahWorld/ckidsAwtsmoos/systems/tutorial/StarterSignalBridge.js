// B"H
/**
 * StarterSignalBridge
 *
 * Chapter 2: The tutorial stops being a button and becomes a nervous system.
 * NPC speech, delivery, trainer learning, profession craft, combat, movement,
 * and hearth binding all pour into one quiet river. No frame tax is required;
 * the bridge listens to gameplay events and advances the first-village arc only
 * when something real happens.
 */
import { ensureStarterExperience } from './StartingExperienceRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

const SIGNAL_EVENT = 'mitzvah-world:starter-signal';
const installed = new WeakMap();
const eventMap = Object.freeze({
  'mitzvah-world:npc-memory':'npc',
  'mitzvah-world:npc-mission':'npc',
  'mitzvah-world:delivery':'delivery',
  'mitzvah-world:trained':'trainer',
  'mitzvah-world:trainer-trained':'trainer',
  'mitzvah-world:profession-trained':'profession',
  'mitzvah-world:profession-craft':'profession',
  'mitzvah-world:hearth-bound':'hearth',
  'mitzvah-world:combat-action':'combat',
  'mitzvah-world:player-moved':'movement',
  'mitzvah-world:zone-discovered':'movement'
});
function Custom(type, detail) { const Ctor = globalThis.CustomEvent; return Ctor ? new Ctor(type, { detail }) : { type, detail }; }
function detailOf(event, signal, extra = {}) { return { signal, source:event?.type || 'direct', detail:event?.detail || null, ...extra, at:Date.now() }; }
function trainerPathFrom(event, extra = {}) { return extra?.trainer?.path || extra?.evidence?.trainer?.path || event?.detail?.trainer?.path || event?.detail?.evidence?.trainer?.path || null; }
function advance(runtime, signal, detail) {
  if (!runtime?.advanceForSignal) return null;
  if (signal === 'trainer') { const path = trainerPathFrom(detail?.event, detail); if (path) runtime.choosePath(path); }
  return runtime.advanceForSignal(signal, detailOf(detail?.event, signal, detail));
}
function listen(scope, type, fn) { scope?.addEventListener?.(type, fn); return () => scope?.removeEventListener?.(type, fn); }
function wrapOnce(target, key, wrapper, mark) { if (!target || typeof target[key] !== 'function' || target[mark]) return false; const original = target[key].bind(target); target[key] = wrapper(original); target[mark] = true; return true; }
export function emitStarterSignal(signal, evidence = {}, scope = globalThis) { const payload = { signal, evidence, at:Date.now() }; scope?.dispatchEvent?.(Custom(SIGNAL_EVENT, payload)); if (scope !== globalThis) globalThis.dispatchEvent?.(Custom(SIGNAL_EVENT, payload)); return payload; }
export function attachStarterGameplaySignals(olam, runtime = globalThis.__MITZVAH_STARTER_EXPERIENCE__) {
  if (!olam) return { ok:false, reason:'missing-olam' };
  const patched = [];
  if (wrapOnce(olam.combatManager, 'attack', original => function starterAttackWrapper(options = {}) { const result = original(options); if (result?.ok) emitStarterSignal('combat', { options, result }); return result; }, '__starterAttackSignalWrapped')) patched.push('combatManager.attack');
  if (wrapOnce(olam, 'ayshPeula', original => function starterUiSignalWrapper(...args) { const result = original(...args); if (args[0] === 'ui event' && args[1] === 'combatLog') emitStarterSignal('combat', { uiEvent:args[1], payload:args[2] }); if (args[0] === 'ui event' && args[1] === 'trainer') emitStarterSignal('trainer', { uiEvent:args[1], payload:args[2] }); return result; }, '__starterAishPeulaSignalWrapped')) patched.push('olam.ayshPeula');
  olam.__starterSignalBridgeAttached = true;
  olam.__starterSignalBridgeRuntime = runtime;
  return { ok:true, patched };
}
export function installStarterSignalBridge(scope = globalThis, runtime = ensureStarterExperience(scope)) {
  if (installed.has(scope)) return installed.get(scope);
  const disposers = [];
  const counts = { movement:0, npc:0, delivery:0, trainer:0, profession:0, combat:0, hearth:0 };
  function note(signal, event = null, extra = {}) { counts[signal] = (counts[signal] || 0) + 1; return advance(runtime, signal, { event, ...extra, count:counts[signal] }); }
  disposers.push(listen(scope, SIGNAL_EVENT, event => note(event.detail?.signal, event, event.detail?.evidence || {})));
  if (scope !== globalThis) disposers.push(listen(globalThis, SIGNAL_EVENT, event => note(event.detail?.signal, event, event.detail?.evidence || {})));
  for (const [type, signal] of Object.entries(eventMap)) disposers.push(listen(scope, type, event => note(signal, event)));
  for (const [type, signal] of Object.entries(eventMap)) if (scope !== globalThis) disposers.push(listen(globalThis, type, event => note(signal, event)));
  let probes = 0;
  const probe = () => { probes += 1; attachStarterGameplaySignals(scope.__AWTSMOOS_OLAM__ || scope.olam || scope.ikar?.olam || scope.mana?.activeOlam, runtime); if (probes < 12) scope.setTimeout?.(probe, 750); };
  scope.setTimeout?.(probe, 25);
  const api = { runtime, counts, note, emit:(signal, evidence) => emitStarterSignal(signal, evidence, scope), attach:olam => attachStarterGameplaySignals(olam, runtime), dispose(){ disposers.forEach(fn => fn?.()); installed.delete(scope); } };
  scope.__MITZVAH_STARTER_SIGNAL_BRIDGE__ = api;
  installed.set(scope, api);
  return api;
}
export default installStarterSignalBridge;
