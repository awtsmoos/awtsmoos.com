// B"H
import assert from 'node:assert/strict';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';

const scene = DEFAULT_SCENE;
const json = JSON.stringify(scene);

assert.equal(scene.id, 'outdoor_professional_default_scene_v1');
assert.equal(scene.scene.style, 'outdoor_professional_cinematic');
assert.equal(scene.authoring.system, 'outdoorProfessionalLivingWorld');
assert.ok(Object.keys(scene.initialCharacters).length >= 7);
assert.ok(scene.initialProps.length >= 10);
assert.ok(scene.events.length >= 40);
assert.ok(scene.scene.visualPromise.includes('off_camera'));
assert.ok(json.includes('blinkTiming') && json.includes('eyeSaccades'));
assert.ok(json.includes('puddle_accumulation') && json.includes('footprints'));
assert.ok(json.includes('automaticReframing') && json.includes('occlusionAvoidance'));
assert.equal(scene.directorBrain.score(scene), 100);
console.log('B"H outdoor detailed default scene smoke passed');
