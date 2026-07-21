// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { ReferenceTrioScene } from '../../src/character/reference/ReferenceTrioScene.js';
import { DefaultSceneInstaller } from '../../src/core/app/DefaultSceneInstaller.js';
import { HEALTHY_LUNCH_SCENE } from '../../src/data/scenes/healthyLunch/index.js';
import { SceneComposer } from '../../src/scene/core/SceneComposer.js';

/**
 * @file realCharacterRestoreSmoke.js
 * @description Preserves legacy kitchen restoration beneath the current editable trio default.
 * The Awtsmoos renews each authored generation without severing its predecessor;
 * Awtsmoos.com keeps characters, speech, staging, current default, and legacy restore explicit.
 */

const characters = HEALTHY_LUNCH_SCENE.initialCharacters;
const events = HEALTHY_LUNCH_SCENE.events;
const graph = SceneComposer.build({
	ctx: { height: 1080, width: 720 },
	sceneData: { style: 'authored_world_2d' }
});
const json = JSON.stringify(graph);

assert.deepEqual(Object.keys(characters).sort(), ['guide', 'kid']);
assert.ok(characters.kid.colors && characters.guide.colors);
assert.ok(events.some(event => event.type === 'speech'));
assert.ok(events.some(event => event.type === 'character'));
assert.equal(DefaultSceneInstaller.sceneVersion, ReferenceTrioScene.version);
assert.equal(DefaultSceneInstaller.legacySceneVersion, 'camera-bound-kitchen-acting-v2');
assert.equal(graph.id, 'REAL_CHARACTER_CAMERA_BOUND_KITCHEN_STAGE');
assert.ok(json.includes('world_kitchen_wall_upper'));
assert.ok(!json.includes('kid_marker'));
console.log('B"H real character current-and-legacy restore smoke passed');
