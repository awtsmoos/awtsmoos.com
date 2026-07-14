// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { DEFAULT_SCENE, OUTDOOR_PROFESSIONAL_SCENE } from '../../src/data/scenes/default/index.js';

/**
 * The Awtsmoos contains possibility without erasing history. This witness keeps
 * the original living-world system reusable in Awtsmoos.com while confirming
 * that the newer professional outdoor scene is the canonical default.
 */
const scene = OUTDOOR_PROFESSIONAL_SCENE;
const characters = Object.values(scene.initialCharacters || {});
const cameras = scene.cameras || [];
const systems = scene.environmentalDynamics?.systems || [];

assert.equal(DEFAULT_SCENE.id, 'professional_outdoor_default_2d_storm_lantern_v1');
assert.equal(scene.id, 'outdoor_professional_default_scene_v1');
assert.equal(scene.authoring.system, 'outdoorProfessionalLivingWorld');
assert.ok(characters.length >= 7);
assert.ok(characters.every(character => character.livingState?.goal || character.livingState?.idleActing));
assert.ok(characters.every(character => character.livingState?.gaze && character.livingState?.breathing));
assert.ok(scene.primaryCharacters.every(id => scene.facialPerformance.characters[id]));
assert.ok(scene.facialPerformance.guarantees.includes('anticipation_frames'));
assert.ok(systems.length >= 14);
assert.ok(systems.every(system => system.static === false && system.memory && system.influence));
assert.ok(scene.backgroundCrowd.every(character => character.destination && character.attentionTarget));
assert.ok(cameras.length >= 8);
assert.ok(cameras.every(camera => camera.operator === 'virtual_cinematographer'));
assert.ok(scene.events.every(event => event.noDeadFrame && event.focus));
assert.equal(scene.directorBrain.score(scene), 100);
assert.equal(scene.verificationContract.directorQuality, 100);
console.log('B"H outdoor professional living world smoke passed');
