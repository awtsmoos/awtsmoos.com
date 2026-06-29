// B"H
/** Audit that the starter zone is booted, persistent, UI-visible, and completeable as a real arc. */
import { readFile } from 'node:fs/promises';
import { resetLivingWorldState, loadLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';
import { loadWorldState } from '../../ckidsAwtsmoos/systems/worldState/WorldStateStore.js';
import { createStartingExperienceRuntime } from '../../ckidsAwtsmoos/systems/tutorial/StartingExperienceRuntime.js';
import { TUTORIAL_STEPS } from '../../ckidsAwtsmoos/systems/tutorial/TutorialStepRegistry.js';
function assert(ok, msg) { if (!ok) throw new Error(msg); }
const memory = new Map();
globalThis.localStorage = { getItem:k => memory.get(k) || null, setItem:(k,v) => memory.set(k, String(v)), removeItem:k => memory.delete(k) };
const events = [];
globalThis.CustomEvent = class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } };
globalThis.addEventListener = () => {};
globalThis.dispatchEvent = event => { events.push(event); return true; };
resetLivingWorldState({});
const runtime = createStartingExperienceRuntime(globalThis, { scope:globalThis });
runtime.start('audit');
runtime.choosePath('helper');
for (const step of TUTORIAL_STEPS) runtime.complete(step.id, { audit:true });
const snap = runtime.snapshot();
assert(snap.progress.done === TUTORIAL_STEPS.length, 'all starter steps should complete');
assert(snap.state.chosenPath.id === 'helper', 'chosen helper path should persist');
assert(events.some(e => e.type === 'mitzvah-world:starter-experience'), 'starter events should emit');
const living = loadLivingWorldState();
assert(living.tutorialProgress.completed.length === TUTORIAL_STEPS.length, 'living-world tutorialProgress should persist');
assert(living.uiPayloads.starterExperience.progress.done === TUTORIAL_STEPS.length, 'UI payload should contain starter progress');
const world = loadWorldState();
assert(world.livingWorld.tutorialProgress.completed.length === TUTORIAL_STEPS.length, 'world-state mirror should persist tutorial progress');
const index = await readFile('index.html', 'utf8');
assert(index.includes('StarterExperienceBootstrap.js'), 'index must boot starter experience');
assert(index.includes('StarterExperienceUiBridge.js'), 'index must load starter UI bridge');
const pkg = await readFile('package.json', 'utf8');
assert(pkg.includes('test:starter-zone'), 'package must expose starter-zone audit script');
console.log(JSON.stringify({ ok:true, steps:TUTORIAL_STEPS.length, events:events.length, next:snap.progress.next, chosen:snap.state.chosenPath.id }, null, 2));
