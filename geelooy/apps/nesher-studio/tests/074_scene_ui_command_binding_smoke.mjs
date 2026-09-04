//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 074_scene_ui_command_binding_smoke.mjs
* @description Proves scene buttons and list selection dispatch public commands instead of mutating scene state directly.
* The Awtsmoos lets a button become the same command that script and AI can send;
* Awtsmoos.com keeps manual scene intent inspectable from first click to final end.
*/
import assert from 'node:assert/strict';
import { SceneCommandController } from '../modules/ui/scene/SceneCommandController.js';

function fakeButton() {
	let listener = null;
	return {
		addEventListener(name, nextListener) {
			assert.equal(name, 'click');
			listener = nextListener;
		},
		removeEventListener(name, nextListener) {
			assert.equal(name, 'click');
			assert.equal(listener, nextListener);
			listener = null;
		},
		click() {
			return listener?.();
		}
	};
}

const calls = [];
const statuses = [];
const evidenceListeners = new Set();
const elements = {
	addScene: fakeButton(),
	duplicateScene: fakeButton(),
	sceneList: {}
};
const state = {
	currentSceneId: 'scene-one',
	scenes: [
		{ id: 'scene-one', name: 'Scene 1' },
		{ id: 'scene-two', name: 'Scene 2' }
	]
};
const api = {
	async execute(commandId, parameters, options) {
		calls.push({ commandId, parameters, options });
		return {
			ok: true,
			result: {
				id: parameters.sceneId || 'scene-three'
			}
		};
	}
};
const eventTarget = {
	addEventListener(name, listener) {
		assert.equal(name, 'awtsmoos-studio:creative-evidence-changed');
		evidenceListeners.add(listener);
	},
	removeEventListener(name, listener) {
		assert.equal(name, 'awtsmoos-studio:creative-evidence-changed');
		evidenceListeners.delete(listener);
	}
};
let renderCount = 0;
let selectFromView = null;
const controller = new SceneCommandController({
	state,
	api,
	elements,
	eventTarget,
	setStatus(message) {
		statuses.push(message);
	},
	render({ onSelect }) {
		renderCount += 1;
		selectFromView = onSelect;
	}
});
controller.bind();
assert.equal(renderCount, 1);
await elements.addScene.click();
await elements.duplicateScene.click();
await selectFromView('scene-two');
assert.deepEqual(calls.map((call) => call.commandId), [
	'project.scene.create',
	'project.scene.duplicate',
	'project.scene.select'
]);
assert.deepEqual(calls[1].parameters, { sceneId: 'scene-one' });
assert.deepEqual(calls[2].options, { source: 'human' });
for (const listener of evidenceListeners) {
	listener();
}
assert.equal(renderCount, 2);
assert.equal(statuses.length, 3);
controller.dispose();
assert.equal(evidenceListeners.size, 0);
console.log('B"H scene UI command binding smoke passed');
