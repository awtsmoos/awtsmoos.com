// B"H
import assert from 'node:assert/strict';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';
import { DirectingEngine } from '../../src/director/intent/index.js';

const plan = DEFAULT_SCENE.directing || DirectingEngine.outdoorStormLantern(DEFAULT_SCENE);
const characterCount = Object.keys(DEFAULT_SCENE.initialCharacters).length;
for (const key of ['storyArc', 'relationships', 'lighting', 'performance', 'eyeContact', 'weatherNarrative', 'directorNotes', 'composition', 'rhythm', 'dashboard']) assert.ok(plan[key], key);
assert.equal(plan.storyArc.length, 6);
assert.equal(plan.lighting.length, plan.storyArc.length);
assert.equal(plan.weatherNarrative.length, plan.storyArc.length);
assert.equal(plan.directorNotes.length, plan.storyArc.length);
assert.equal(plan.rhythm.length, plan.storyArc.length);
assert.equal(Object.keys(plan.performance).length, characterCount);
assert.equal(Object.keys(plan.eyeContact).length, characterCount);
assert.equal(Object.keys(plan.relationships).length, characterCount);
assert.equal(plan.composition.length, DEFAULT_SCENE.cameras.length);
assert.equal(plan.dashboard.health, 'directed_scene_ready');
assert.equal(plan.dashboard.arcPoints, 6);
assert.ok(plan.lighting.some(beat => beat.mood === 'victory' && beat.bloom === 1));
assert.ok(plan.eyeContact.goat_sidekick.some(mark => mark.target === 'wrong_cord'));
assert.ok(plan.directorNotes.some(note => note.mustHold === 'breathUntilLightning'));
console.log('B"H directing engine smoke passed');
