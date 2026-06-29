// B"H
import assert from 'node:assert/strict';
import { DEFAULT_SCENE, OUTDOOR_PROFESSIONAL_SCENE } from '../../src/data/scenes/default/index.js';

const scene = OUTDOOR_PROFESSIONAL_SCENE;
const characters = Object.values(scene.initialCharacters || {});
const cameras = scene.cameras || [];
const systems = scene.environmentalDynamics?.systems || [];

assert.equal(DEFAULT_SCENE.id, 'outdoor_professional_default_scene_v1');
assert.equal(scene.authoring.system, 'outdoorProfessionalLivingWorld');
assert.ok(characters.length >= 7);
assert.ok(characters.every(c => c.livingState?.goal || c.livingState?.idleActing));
assert.ok(characters.every(c => c.livingState?.gaze && c.livingState?.breathing));
assert.ok(scene.primaryCharacters.every(id => scene.facialPerformance.characters[id]));
assert.ok(scene.facialPerformance.guarantees.includes('anticipation_frames'));
assert.ok(systems.length >= 14);
assert.ok(systems.every(system => system.static === false && system.memory && system.influence));
assert.ok(scene.backgroundCrowd.every(c => c.destination && c.attentionTarget && c.obstacleAvoidance));
assert.ok(cameras.length >= 8);
assert.ok(cameras.every(c => c.operator === 'virtual_cinematographer' && c.compositionRepair.length >= 3));
assert.ok(scene.events.every(event => event.noDeadFrame && event.focus));
assert.equal(scene.directorBrain.score(scene), 100);
assert.deepEqual(Object.values(scene.verificationContract).filter(v => v === true).length, 8);
assert.equal(scene.verificationContract.directorQuality, 100);
console.log('B"H outdoor professional living world smoke passed');
