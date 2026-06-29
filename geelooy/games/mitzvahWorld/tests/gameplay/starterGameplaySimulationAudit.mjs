// B"H
/** Full headless gameplay simulation for the starter arc, including persistence and exact milestones. */
import { simulateStarterGameplay } from '../../ckidsAwtsmoos/systems/tutorial/StarterGameplaySimulationRuntime.js';
import { loadLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';
import { loadWorldState } from '../../ckidsAwtsmoos/systems/worldState/WorldStateStore.js';
import { TUTORIAL_STEPS } from '../../ckidsAwtsmoos/systems/tutorial/TutorialStepRegistry.js';
function assert(ok,msg){ if(!ok) throw new Error(msg); }
const memory = new Map();
globalThis.localStorage = { getItem:k => memory.get(k) || null, setItem:(k,v) => memory.set(k,String(v)), removeItem:k => memory.delete(k) };
const result = await simulateStarterGameplay();
const expected = TUTORIAL_STEPS.map(step => step.id);
const completed = result.snapshot.state.completed;
assert(result.ok, 'simulated gameplay should complete starter arc');
assert(result.snapshot.state.chosenPath?.id === 'helper', 'trainer signal should choose helper path');
assert(JSON.stringify(completed) === JSON.stringify(expected), 'completed starter IDs should exactly match the arc order');
assert(new Set(completed).size === completed.length, 'completed starter IDs should be unique');
for (const signal of ['movement','npc','delivery','trainer','profession','combat','hearth']) assert(result.signals[signal] >= 1, `missing simulated signal ${signal}`);
const living = loadLivingWorldState();
assert(JSON.stringify(living.tutorialProgress.completed) === JSON.stringify(expected), 'living-world progress should persist exact IDs');
assert(living.uiPayloads.starterExperience.progress.done === expected.length, 'starter UI payload should survive persistence');
const world = loadWorldState();
assert(JSON.stringify(world.livingWorld.tutorialProgress.completed) === JSON.stringify(expected), 'world-state mirror should persist exact IDs');
console.log(JSON.stringify({ ok:true, expected, completed, chosen:result.snapshot.state.chosenPath.id, signals:result.signals, uiDone:living.uiPayloads.starterExperience.progress.done }, null, 2));
