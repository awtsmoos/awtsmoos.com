// B"H
/**
 * StartingExperienceRuntime
 * The starter arc is now idempotent and save-coalesced: one signal produces one
 * saved starter payload, not a persist plus a UI persist. The first village can
 * teach without stealing the frame budget.
 */
import { getStarterClassPath, listStarterClassPaths } from './StarterClassPathRegistry.js';
import { TUTORIAL_STEPS, tutorialProgress, getTutorialStep } from './TutorialStepRegistry.js';
import { loadLivingWorldState, saveLivingWorldState, commitUiPayloads } from '../livingWorld/LivingWorldState.js';
import { persistLivingWorldToWorldState } from '../livingWorld/LivingWorldPersistenceBridge.js';

const EVENT = 'mitzvah-world:starter-experience';
const cap = (xs = [], n = 40) => xs.slice(-n);
const clone = value => JSON.parse(JSON.stringify(value ?? null));
const now = () => Date.now();
const stepIds = () => TUTORIAL_STEPS.map(step => step.id);
function Custom(type, detail) { const Ctor = globalThis.CustomEvent; return Ctor ? new Ctor(type, { detail }) : { type, detail }; }
function unique(list = []) { return [...new Set(list.filter(Boolean))]; }
function resolveStore(source) {
  if (source?.npcs && source?.economy) return source;
  if (source?.__MITZVAH_WORLD_STATE__) return source.__MITZVAH_WORLD_STATE__;
  const store = globalThis.__MITZVAH_WORLD_STATE__ || loadLivingWorldState();
  if (source && typeof source === 'object') source.__MITZVAH_WORLD_STATE__ = store;
  globalThis.__MITZVAH_WORLD_STATE__ = store;
  return store;
}
function ensureState(store) {
  const completed = unique(store.startingExperience?.completed || store.tutorialProgress?.completed || []).filter(x => stepIds().includes(x));
  const progress = tutorialProgress(completed);
  store.tutorialProgress ||= { completed:[], hints:[], started:false, events:[] };
  store.startingExperience ||= { chosenPath:null, completed:[], hints:[], started:false, events:[] };
  store.startingExperience.completed = completed;
  store.tutorialProgress.completed = completed;
  store.tutorialProgress.total = progress.total;
  store.tutorialProgress.next = progress.next?.id || null;
  return store.startingExperience;
}
function payloadFor(store, type, payload) {
  const state = ensureState(store);
  return { type, payload, state:clone(state), progress:tutorialProgress(state.completed || []), steps:TUTORIAL_STEPS, paths:listStarterClassPaths(), at:now() };
}
function syncProgress(store, reason) {
  const state = ensureState(store);
  const completed = unique(state.completed || []).filter(x => stepIds().includes(x));
  store.tutorialProgress = { ...(store.tutorialProgress || {}), completed, hints:cap(state.hints || []), started:state.started, chosenPath:state.chosenPath, total:TUTORIAL_STEPS.length, next:tutorialProgress(completed).next?.id || null, lastReason:reason, updatedAt:now() };
  return state;
}
function saveStarter(store, reason) {
  commitUiPayloads(store);
  const saved = saveLivingWorldState(store);
  persistLivingWorldToWorldState(saved, { reason:`starter-experience:${reason}` });
  return saved;
}
function emit(scope, store, type, payload, reason) {
  const detail = payloadFor(store, type, payload);
  store.uiPayloads ||= {};
  store.uiPayloads.starterExperience = detail;
  if (reason) saveStarter(store, reason);
  scope?.dispatchEvent?.(Custom(EVENT, detail));
  if (scope !== globalThis) globalThis.dispatchEvent?.(Custom(EVENT, detail));
  scope?.__MITZVAH_UI_BRIDGE__?.receive?.('starterExperience', detail);
  return detail;
}
function record(state, type, payload) { state.events = cap([...(state.events || []), { type, payload, at:now() }]); }
function completionMap(signal) { return { movement:'wake', npc:'first_chessed', delivery:'first_chessed', trainer:'first_training', profession:'first_profession', combat:'first_danger', hearth:'home_return' }[signal] || signal; }
export function createStartingExperienceRuntime(source = globalThis, options = {}) {
  const scope = options.scope || globalThis;
  const store = resolveStore(source);
  const state = ensureState(store);
  const api = {
    store, state,
    current() { return payloadFor(store, 'current', null); },
    start(reason = 'manual') {
      const first = !state.started;
      state.started = true;
      state.startedAt ||= now();
      if (first) record(state, 'start', { reason });
      syncProgress(store, `start:${reason}`);
      return emit(scope, store, first ? 'start' : 'start-refresh', this.current(), `start:${reason}`);
    },
    choosePath(id = 'learner') {
      const next = getStarterClassPath(id);
      const changed = state.chosenPath?.id !== next.id;
      state.chosenPath = next;
      if (changed) record(state, 'path', state.chosenPath);
      syncProgress(store, `path:${state.chosenPath.id}`);
      return emit(scope, store, changed ? 'path' : 'path-refresh', state.chosenPath, `path:${state.chosenPath.id}`);
    },
    complete(id, evidence = {}) {
      const step = getTutorialStep(id);
      const wasDone = state.completed.includes(step.id);
      if (!wasDone) state.completed.push(step.id);
      state.completed = unique(state.completed).filter(x => stepIds().includes(x));
      state.lastCompleted = step.id;
      state.lastEvidence = { stepId:step.id, evidence, repeated:wasDone, at:now() };
      if (!wasDone) record(state, 'complete', { step, evidence });
      const reason = `${wasDone ? 'repeat' : 'complete'}:${step.id}`;
      syncProgress(store, reason);
      return emit(scope, store, wasDone ? 'complete-refresh' : 'complete', { step, evidence, repeated:wasDone }, reason);
    },
    completeCurrent(evidence = {}) { const next = tutorialProgress(state.completed || []).next; return next ? this.complete(next.id, evidence) : emit(scope, store, 'complete-all', evidence, 'complete-all'); },
    hint() {
      const next = tutorialProgress(state.completed || []).next || TUTORIAL_STEPS.at(-1);
      const changed = next && state.hints.at(-1) !== next.id;
      if (changed) state.hints.push(next.id);
      if (changed) record(state, 'hint', next);
      const reason = `hint:${next?.id || 'none'}`;
      syncProgress(store, reason);
      return emit(scope, store, changed ? 'hint' : 'hint-refresh', next, reason);
    },
    advanceForSignal(signal, evidence = {}) { return this.complete(completionMap(signal), evidence); },
    snapshot() { return payloadFor(store, 'snapshot', null); }
  };
  scope.__MITZVAH_STARTER_EXPERIENCE__ = api;
  globalThis.__MITZVAH_STARTER_EXPERIENCE__ = api;
  if (options.autostart) api.start(options.reason || 'autostart');
  return api;
}
export function ensureStarterExperience(scope = globalThis, options = {}) { return scope.__MITZVAH_STARTER_EXPERIENCE__ || createStartingExperienceRuntime(scope.__MITZVAH_WORLD_STATE__ || scope, { ...options, scope }); }
export function startTutorial(source = globalThis.__MITZVAH_WORLD_STATE__ || globalThis) { return ensureStarterExperience(globalThis, { source }).start('legacy-startTutorial'); }
export function completeTutorialStep(id, source = globalThis.__MITZVAH_WORLD_STATE__ || globalThis) { return createStartingExperienceRuntime(source).complete(id); }
export function chooseStarterPath(id, source = globalThis.__MITZVAH_WORLD_STATE__ || globalThis) { return createStartingExperienceRuntime(source).choosePath(id); }
export default createStartingExperienceRuntime;
