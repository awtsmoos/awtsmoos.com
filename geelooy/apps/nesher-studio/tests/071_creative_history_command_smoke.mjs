//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 071_creative_history_command_smoke.mjs
* @description Proves Undo and Redo traverse canonical project history through the same API and AI command language.
* The Awtsmoos reveals one project through time while every operator enters the same gate;
* Awtsmoos.com keeps undo, redo, serialization, and editor aliases joined to one editable fate.
*/
import assert from 'node:assert/strict';
import { serializeProject } from '../modules/project/Project.js';
import { installCreativeRuntime } from '../modules/creative/runtime/installCreativeRuntime.js';
import { createState } from '../modules/state.js';

const HISTORY_SURFACES = ['human', 'command', 'script', 'json', 'ai'];
const state = createState();
const creative = installCreativeRuntime(state, { exposeGlobal: false });
const projectIdentity = state.project;
const initialSceneId = state.currentSceneId;
const initialSceneCount = state.project.scenes.length;
const initialLogLength = state.project.creative.operationLog.length;

for (const commandId of ['history.undo', 'history.redo']) {
	const apiMetadata = creative.api.commands().find((item) => item.id === commandId);
	const aiMetadata = creative.ai.discover(commandId).find((item) => item.id === commandId);
	assert.ok(apiMetadata);
	assert.deepEqual(aiMetadata, apiMetadata);
	assert.equal(apiMetadata.mutation, 'history');
	for (const surface of HISTORY_SURFACES) {
		assert.ok(apiMetadata.surfaces.includes(surface));
	}
}

const createEvidence = await creative.api.execute(
	'project.scene.create',
	{ name: 'History Command Scene' },
	{ source: 'human' }
);
const createdSceneId = createEvidence.result.id;
const createdSnapshot = serializeProject(state.project);
assert.equal(state.currentSceneId, createdSceneId);
assert.equal(createdSnapshot.scenes.length, initialSceneCount + 1);
assert.equal(createdSnapshot.creative.operationLog.at(-1).commandId, 'project.scene.create');

const undoEvidence = await creative.ai.execute('history.undo', {});
const undoneSnapshot = serializeProject(state.project);
assert.equal(undoEvidence.ok, true);
assert.equal(state.project, projectIdentity);
assert.equal(state.project.scenes.length, initialSceneCount);
assert.equal(state.currentSceneId, initialSceneId);
assert.equal(state.scenes, state.project.scenes);
assert.equal(undoneSnapshot.currentSceneId, initialSceneId);
assert.equal(undoneSnapshot.creative.operationLog.length, initialLogLength);
assert.equal(state.project.undo.future.length > 0, true);

const redoEvidence = await creative.api.executeJson({
	commandId: 'history.redo',
	parameters: {},
	source: 'api'
});
const redoneSnapshot = serializeProject(state.project);
assert.equal(redoEvidence.ok, true);
assert.equal(state.project, projectIdentity);
assert.equal(state.project.scenes.length, initialSceneCount + 1);
assert.equal(state.currentSceneId, createdSceneId);
assert.equal(state.scenes, state.project.scenes);
assert.equal(redoneSnapshot.currentSceneId, createdSceneId);
assert.equal(redoneSnapshot.creative.operationLog.at(-1).commandId, 'project.scene.create');
assert.equal(redoneSnapshot.scenes.some((scene) => scene.id === createdSceneId), true);

console.log('B"H creative history command smoke passed');
