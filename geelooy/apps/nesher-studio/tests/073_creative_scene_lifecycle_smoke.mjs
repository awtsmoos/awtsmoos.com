//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 073_creative_scene_lifecycle_smoke.mjs
* @description Proves scene selection, duplication, rename, deletion, serialization, history, and source identity through shared commands.
* The Awtsmoos keeps every scene editable whether the caller is human, JSON, API, or AI;
* Awtsmoos.com proves copied sparks receive new names while one canonical project remains the sky.
*/
import assert from 'node:assert/strict';
import { serializeProject } from '../modules/project/Project.js';
import { installCreativeRuntime } from '../modules/creative/runtime/installCreativeRuntime.js';
import { createState } from '../modules/state.js';

const state = createState();
const creative = installCreativeRuntime(state, { exposeGlobal: false });
const firstScene = state.project.scenes[0];
firstScene.sources.push({
	id: 'text-seed',
	type: 'text',
	name: 'Seed Title',
	x: 10,
	y: 12,
	meta: { purpose: 'scene-copy-proof' },
	settings: { fontSize: 48 }
});
firstScene.sourceIds.push('text-seed');

const commandIds = creative.api.commands().map((item) => item.id);
for (const id of [
	'project.scene.select',
	'project.scene.duplicate',
	'project.scene.rename',
	'project.scene.delete'
]) {
	assert.ok(commandIds.includes(id));
}

const second = await creative.api.execute(
	'project.scene.create',
	{ name: 'Second Scene' },
	{ source: 'human' }
);
const selectUndoDepth = state.project.undo.past.length;
await creative.ai.execute('project.scene.select', { sceneId: firstScene.id });
assert.equal(state.currentSceneId, firstScene.id);
assert.equal(state.selectedId, null);
assert.equal(state.project.undo.past.length, selectUndoDepth);

const duplicate = await creative.api.executeJson({
	commandId: 'project.scene.duplicate',
	parameters: { sceneId: firstScene.id },
	source: 'api'
});
const copyId = duplicate.result.id;
const copy = state.project.scenes.find((scene) => scene.id === copyId);
assert.ok(copy);
assert.notEqual(copy.id, firstScene.id);
assert.notEqual(copy.sources[0].id, firstScene.sources[0].id);
assert.equal(copy.sources[0].x, 34);
assert.equal(copy.sources[0].y, 36);
assert.deepEqual(copy.sources[0].meta, firstScene.sources[0].meta);
assert.equal(state.currentSceneId, copy.id);

await creative.ai.execute('project.scene.rename', {
	sceneId: copy.id,
	name: 'Renamed Copy'
});
assert.equal(copy.name, 'Renamed Copy');
const beforeDelete = serializeProject(state.project);
await creative.api.execute('project.scene.delete', { sceneId: copy.id }, { source: 'human' });
assert.equal(state.project.scenes.some((scene) => scene.id === copy.id), false);
assert.equal(state.currentSceneId, second.result.id);
assert.equal(serializeProject(state.project).scenes.some((scene) => scene.id === copy.id), false);

await creative.api.execute('history.undo', {}, { source: 'api' });
assert.equal(state.project.scenes.some((scene) => scene.id === copy.id), true);
assert.deepEqual(serializeProject(state.project).scenes, beforeDelete.scenes);
await creative.api.execute('history.redo', {}, { source: 'api' });
assert.equal(state.project.scenes.some((scene) => scene.id === copy.id), false);

const singleState = createState();
const singleCreative = installCreativeRuntime(singleState, { exposeGlobal: false });
await assert.rejects(() => singleCreative.api.execute(
	'project.scene.delete',
	{ sceneId: singleState.currentSceneId },
	{ source: 'human' }
));
console.log('B"H creative scene lifecycle smoke passed');
