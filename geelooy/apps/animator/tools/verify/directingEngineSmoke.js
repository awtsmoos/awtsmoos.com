// B"H
import assert from 'node:assert/strict';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';
import { DirectingEngine } from '../../src/director/intent/index.js';

const plan = DEFAULT_SCENE.directing || DirectingEngine.outdoorStormLantern(DEFAULT_SCENE);
const characterCount = Object.keys(DEFAULT_SCENE.initialCharacters).length;
for (const key of ['storyArc', 'relationships', 'lighting', 'performance', 'eyeContact', 'weatherNarrative', 'directorNotes', 'composition', 'rhythm', 'silenceBeats', 'propStates', 'environmentalMemory', 'dashboard', 'continuity']) assert.ok(plan[key], key);
assert.equal(plan.storyArc.length, 6);
assert.equal(plan.silenceBeats.length, 6);
assert.equal(plan.environmentalMemory.length, 6);
assert.equal(Object.keys(plan.performance).length, characterCount);
assert.equal(Object.keys(plan.eyeContact).length, characterCount);
assert.equal(Object.keys(plan.propStates).length, DEFAULT_SCENE.initialProps.length);
assert.equal(plan.composition.length, DEFAULT_SCENE.cameras.length);
assert.equal(plan.dashboard.health, 'directed_scene_ready');
assert.equal(plan.continuity.ok, true);
assert.equal(plan.continuity.score, 100);
assert.ok(plan.lighting.some(beat => beat.mood === 'victory' && beat.bloom === 1));
assert.ok(plan.eyeContact.goat_sidekick.some(mark => mark.target === 'wrong_cord'));
assert.ok(plan.propStates.storm_lantern.some(mark => mark.storyState === 'featuredByStoryArc'));
console.log('B"H directing engine smoke passed');
