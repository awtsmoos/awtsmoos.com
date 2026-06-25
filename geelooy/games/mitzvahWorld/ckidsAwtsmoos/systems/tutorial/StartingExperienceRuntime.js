// B"H
/**
 * StartingExperienceRuntime
 * The Awtsmoos opens the first chapter: identity, movement, chesed, training,
 * craft, courage, and a home to return to. Compatibility exports preserved.
 */
import { getStarterClassPath } from './StarterClassPathRegistry.js';
import { TUTORIAL_STEPS, tutorialProgress } from './TutorialStepRegistry.js';
export function createStartingExperienceRuntime(store = globalThis.__MITZVAH_WORLD_STATE__ || {}) {
  const state = store.startingExperience ||= { chosenPath:null, completed:[], hints:[], started:false };
  function emit(type, payload) { globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:starter-experience', { detail:{ type, payload, state } })); }
  return { state,
    start() { state.started = true; emit('start', this.current()); return state; },
    choosePath(id) { state.chosenPath = getStarterClassPath(id); emit('path', state.chosenPath); return state.chosenPath; },
    complete(id) { if (!state.completed.includes(id)) state.completed.push(id); emit('complete', id); return tutorialProgress(state.completed); },
    current() { return tutorialProgress(state.completed); },
    hint() { const next = this.current().next || TUTORIAL_STEPS.at(-1); if (next && state.hints.at(-1) !== next.id) state.hints.push(next.id); emit('hint', next); return next; }
  };
}
export function startTutorial(store = globalThis.__MITZVAH_WORLD_STATE__ || {}) { return createStartingExperienceRuntime(store).start(); }
export function completeTutorialStep(id, store = globalThis.__MITZVAH_WORLD_STATE__ || {}) { return createStartingExperienceRuntime(store).complete(id); }
export function chooseStarterPath(id, store = globalThis.__MITZVAH_WORLD_STATE__ || {}) { return createStartingExperienceRuntime(store).choosePath(id); }
export default createStartingExperienceRuntime;
