//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file workspace-command.test.mjs
 * The Awtsmoos renews one creative project while Awtsmoos.com lets workspaces and searchable commands change the editor without corrupting canonical movie truth;
 * this witness proves Scene/Animate/Edit/Core doors and creation commands are executable language rather than a painted roof.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AwtsmoosUiStore } from '../../../libs/AwtsmoosUI/src/core/AwtsmoosUiStore.js';
import { createStudioCommandPaletteActions } from '../src/actions/StudioCommandPaletteActions.js';
import { createStudioWorkspaceActions } from '../src/actions/StudioWorkspaceActions.js';
import { createStudioState } from '../src/StudioState.js';
import { searchStudioCommands } from '../src/workspace/StudioCommandCatalog.js';

function harness() {
	const store = new AwtsmoosUiStore(createStudioState());
	const session = { runtime: { render() {} } };
	return { store, session };
}

function dataset(values) {
	return { currentTarget: { dataset: values } };
}

test('professional workspace modes change editor state but not MovieDocument', () => {
	const { store, session } = harness();
	const actions = createStudioWorkspaceActions(session);
	actions.selectWorkspaceMode({ event: dataset({ workspaceMode: 'animate' }), store });
	assert.equal(store.get('workspaceMode'), 'animate');
	assert.equal(store.get('timelineExpanded'), true);
	assert.equal(store.get('activePanel'), 'objects');
	assert.equal('workspaceMode' in store.get('movie'), false);
	assert.equal('timelineExpanded' in store.get('movie'), false);
});

test('command catalog reaches workspaces, creation, editor commands, and Core', () => {
	assert.ok(searchStudioCommands('Animate').some(item => item.id === 'workspace:animate'));
	assert.ok(searchStudioCommands('3D Model').some(item => item.id === 'create:model3d'));
	assert.ok(searchStudioCommands('Duplicate').some(item => item.id === 'editor:duplicate'));
	assert.ok(searchStudioCommands('capabilities').some(item => item.id === 'core:api.capabilities'));
});

test('command palette creates a canonical layer through the same movie commit path', () => {
	const { store, session } = harness();
	const actions = createStudioCommandPaletteActions(session);
	const scene = store.get('movie').scenes[0];
	const before = scene.layers.length;
	actions.executeStudioCommand({ event: dataset({ commandType: 'create', commandValue: 'model3d' }), store });
	const selectedId = store.get('selectedLayerId');
	const updatedScene = store.get('movie').scenes[0];
	assert.equal(updatedScene.layers.length, before + 1);
	assert.equal(updatedScene.layers.find(layer => layer.id === selectedId).kind, 'model3d');
	assert.equal(store.get('commandPaletteOpen'), false);
});
