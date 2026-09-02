//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file editor-actions.test.mjs
 * The Awtsmoos renews object and coordinate while Awtsmoos.com proves editor gestures alter the canonical movie rather than a decorative shell;
 * creation, selection, duplication, movement, and deletion testify that the new UI possesses a working creative soul.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AwtsmoosUiStore } from '../../../libs/AwtsmoosUI/src/core/AwtsmoosUiStore.js';
import { createStudioEditorActions } from '../src/actions/StudioEditorActions.js';
import { createStudioState } from '../src/StudioState.js';
import { getStudioScene } from '../src/editor/StudioLayerAccess.js';

function createEditorHarness() {
	let renderCount = 0;
	const store = new AwtsmoosUiStore(createStudioState());
	const session = {
		runtime: {
			render() {
				renderCount += 1;
			}
		}
	};
	return {
		store,
		actions: createStudioEditorActions(session),
		renderCount: () => renderCount
	};
}

function eventWithDataset(dataset) {
	return { currentTarget: { dataset } };
}

test('create, transform, duplicate, and delete mutate canonical movie state', () => {
	const harness = createEditorHarness();
	const sceneBefore = getStudioScene(harness.store.get('movie'), harness.store.get('selectedSceneId'));
	const countBefore = sceneBefore.layers.length;

	harness.actions.createEditorLayer({
		event: eventWithDataset({ layerKind: 'shape2d' }),
		store: harness.store
	});
	const createdId = harness.store.get('selectedLayerId');
	const createdScene = getStudioScene(harness.store.get('movie'), harness.store.get('selectedSceneId'));
	const createdLayer = createdScene.layers.find(layer => layer.id === createdId);
	assert.equal(createdScene.layers.length, countBefore + 1);
	assert.equal(createdLayer.kind, 'shape2d');

	harness.actions.nudgeLayerTransform({
		event: eventWithDataset({ transformField: 'x', transformDelta: '0.25' }),
		store: harness.store
	});
	const movedScene = getStudioScene(harness.store.get('movie'), harness.store.get('selectedSceneId'));
	assert.equal(movedScene.layers.find(layer => layer.id === createdId).transform.x, 0.25);

	harness.actions.duplicateEditorLayer({ store: harness.store });
	const duplicateId = harness.store.get('selectedLayerId');
	assert.notEqual(duplicateId, createdId);
	assert.equal(getStudioScene(harness.store.get('movie'), harness.store.get('selectedSceneId')).layers.length, countBefore + 2);

	harness.actions.deleteEditorLayer({ store: harness.store });
	assert.equal(getStudioScene(harness.store.get('movie'), harness.store.get('selectedSceneId')).layers.length, countBefore + 1);
	assert.ok(harness.renderCount() >= 4);
	assert.match(harness.store.get('jsonDraft'), /shape2d/);
});

test('editor UI state keeps tool, viewport, panel, and snap independent from movie schema', () => {
	const harness = createEditorHarness();
	harness.actions.selectEditorTool({ event: eventWithDataset({ editorTool: 'rotate' }), store: harness.store });
	harness.actions.selectViewportMode({ event: eventWithDataset({ viewportMode: '3d' }), store: harness.store });
	harness.actions.openEditorPanel({ event: eventWithDataset({ editorPanel: 'procedural' }), store: harness.store });
	harness.actions.toggleEditorSnap({ store: harness.store });
	assert.equal(harness.store.get('activeTool'), 'rotate');
	assert.equal(harness.store.get('viewportMode'), '3d');
	assert.equal(harness.store.get('activePanel'), 'procedural');
	assert.equal(harness.store.get('mobilePanelOpen'), true);
	assert.equal(harness.store.get('snapEnabled'), true);
	assert.equal('activeTool' in harness.store.get('movie'), false);
});
