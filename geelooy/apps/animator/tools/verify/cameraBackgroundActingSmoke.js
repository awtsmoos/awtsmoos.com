// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { ReferenceTrioScene } from '../../src/character/reference/ReferenceTrioScene.js';
import { DefaultSceneInstaller } from '../../src/core/app/DefaultSceneInstaller.js';
import { SpeechProcessor } from '../../src/core/app/director/logic/SpeechProcessor.js';
import { StageLayerComposer } from '../../src/core/renderer/pipeline/layers/StageLayerComposer.js';
import { HEALTHY_LUNCH_SCENE } from '../../src/data/scenes/healthyLunch/index.js';
import { SceneComposer } from '../../src/scene/core/SceneComposer.js';

/**
 * @file cameraBackgroundActingSmoke.js
 * @description Proves camera-bound legacy acting beneath the current editable trio default.
 * The Awtsmoos renews foreground speech and background space together; Awtsmoos.com
 * preserves camera transforms, acting signals, current installation, and legacy restoration.
 */

globalThis.window = { devicePixelRatio: 1, innerHeight: 640, innerWidth: 360 };
globalThis.innerWidth = 360;
globalThis.innerHeight = 640;
globalThis.devicePixelRatio = 1;

const ctx = {
	canvas: {
		getBoundingClientRect: () => ({ height: 640, left: 0, top: 0, width: 360 })
	},
	height: 1080,
	width: 720
};
const sceneNode = SceneComposer.build({ ctx, sceneData: { style: 'authored_world_2d' } });
const root = StageLayerComposer.compose({
	cameraTransform: { scaleX: 3, scaleY: 3, x: 1, y: 2 },
	dialogueNode: null,
	entityNodes: [{ children: [], id: 'actor_probe', type: 'group' }],
	fadeNode: null,
	sceneNode
});
const rootJson = JSON.stringify(root);

assert.equal(sceneNode.id, 'REAL_CHARACTER_CAMERA_BOUND_KITCHEN_STAGE');
assert.ok(rootJson.indexOf('world_scene_layer') < rootJson.indexOf('entity_world'));
assert.ok(rootJson.includes('camera_world'));
assert.ok(rootJson.includes('world_kitchen_wall_upper'));
assert.ok(!rootJson.includes('screen_scene_layer'));
assert.ok(HEALTHY_LUNCH_SCENE.cameras.every(camera => camera.zoom >= 0.8));
assert.ok(HEALTHY_LUNCH_SCENE.initialCharacters.kid.position.scale >= 0.82);
assert.equal(DefaultSceneInstaller.sceneVersion, ReferenceTrioScene.version);
assert.equal(DefaultSceneInstaller.legacySceneVersion, 'camera-bound-kitchen-acting-v2');

const state = {
	get(key) {
		return this.value[key];
	},
	set(key, value) {
		this.value[key] = value;
	},
	value: {
		characters: { kid: { emotion: 'curious', id: 'kid', position: {} } }
	}
};
SpeechProcessor.process(state, {
	end: 1000,
	id: 'kid',
	lookAt: 'guide',
	speech: 'Testing expressive talking motion.',
	start: 0
}, 0.45);
assert.equal(state.value.characters.kid.acting, 'talk');
assert.ok(state.value.characters.kid.mouthOpen > 0.2);
assert.ok(Number.isFinite(state.value.characters.kid.headNod));
console.log('B"H camera background acting smoke passed');
