// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { ReferenceTrioScene } from '../../src/character/reference/ReferenceTrioScene.js';
import { CinematicCharacterStaging } from '../../src/core/renderer/pipeline/phases/CinematicCharacterStaging.js';
import { DefaultSceneInstaller } from '../../src/core/app/DefaultSceneInstaller.js';
import { PropProcessor } from '../../src/core/app/director/logic/PropProcessor.js';
import { HEALTHY_LUNCH_SCENE } from '../../src/data/scenes/healthyLunch/index.js';
import { SceneComposer } from '../../src/scene/core/SceneComposer.js';

/**
 * @file carefulPolishSmoke.js
 * @description Proves restrained legacy staging beneath the current editable trio default.
 * The Awtsmoos renews proportion without bloat; Awtsmoos.com preserves current installation,
 * legacy restoration, camera discipline, prop limits, and focused character staging.
 */

const characters = HEALTHY_LUNCH_SCENE.initialCharacters;
const props = HEALTHY_LUNCH_SCENE.initialProps;
const cameras = HEALTHY_LUNCH_SCENE.cameras;
const events = HEALTHY_LUNCH_SCENE.events;
const graph = SceneComposer.build({
	ctx: { height: 1080, width: 720 },
	sceneData: { style: 'authored_world_2d' }
});
const staged = CinematicCharacterStaging.apply(characters.kid, {
	activeDialogue: { speakerId: 'kid' },
	camera: cameras.find(camera => camera.id === 'hl_table')
});

assert.deepEqual(Object.keys(characters).sort(), ['guide', 'kid']);
assert.ok(characters.kid.position.scale >= 0.82);
assert.ok(cameras.every(camera => camera.zoom <= 1.02 && camera.zoom >= 0.8));
assert.ok(props.every(prop => prop.size <= 22));
assert.ok(events.some(event => event.type === 'speech'));
assert.equal(graph.id, 'REAL_CHARACTER_CAMERA_BOUND_KITCHEN_STAGE');
assert.ok(JSON.stringify(graph).includes('world_kitchen_wall_upper'));
assert.ok(staged._cinematicFocus);
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
		props: [{ id: 'apple', size: 14, type: 'apple', x: 0, y: 0 }]
	}
};
PropProcessor.process(state, {
	action: 'hop',
	from: { x: 0, y: 100 },
	height: 200,
	id: 'apple',
	size: 40,
	to: { x: 10, y: 100 },
	type: 'apple'
}, 0.5);
assert.ok(state.value.props[0].size <= 24);
assert.ok(state.value.props[0].y >= 82);
console.log('B"H careful camera-bound polish smoke passed');
