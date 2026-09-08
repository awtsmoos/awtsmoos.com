//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file editor-actions.test.mjs
 * @description Proves primary visible editor mutations alter canonical movie truth eagerly while genuinely deeper editor families stay lazy and non-duplicated.
 * The Awtsmoos renews object and coordinate while Awtsmoos.com keeps the visible doorway awake and the movie soul pure; creation, movement, duplication, viewport choice, and deletion travel through the same eager vessel the mobile maker can actually touch.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { AwtsmoosUiStore } from '../../../libs/AwtsmoosUI/src/core/AwtsmoosUiStore.js';
import { createStudioActions } from '../src/StudioActions.js';
import { createStudioEditorActions } from '../src/actions/StudioEditorActions.js';
import { createStudioState } from '../src/StudioState.js';
import { getStudioScene } from '../src/editor/StudioLayerAccess.js';
function createEditorHarness() {
	let renderCount = 0;
	const store = new AwtsmoosUiStore(createStudioState());
	const session = { runtime: { render() { renderCount += 1; } } };
	return { store, shellActions: createStudioActions(session), editorActions: createStudioEditorActions(session), renderCount: () => renderCount };
}
function eventWithDataset(dataset) { return { currentTarget: { dataset } }; }
test('create, transform, duplicate, and delete mutate canonical movie state eagerly', () => {
	const harness = createEditorHarness();
	const actions = harness.shellActions;
	const sceneBefore = getStudioScene(harness.store.get('movie'), harness.store.get('selectedSceneId'));
	const countBefore = sceneBefore.layers.length;
	actions.createEditorLayer({ event: eventWithDataset({ layerKind: 'shape2d' }), store: harness.store });
	const createdId = harness.store.get('selectedLayerId');
	const createdScene = getStudioScene(harness.store.get('movie'), harness.store.get('selectedSceneId'));
	const createdLayer = createdScene.layers.find(layer => layer.id === createdId);
	assert.equal(createdScene.layers.length, countBefore + 1);
	assert.equal(createdLayer.kind, 'shape2d');
	actions.nudgeLayerTransform({ event: eventWithDataset({ transformField: 'x', transformDelta: '0.25' }), store: harness.store });
	const movedScene = getStudioScene(harness.store.get('movie'), harness.store.get('selectedSceneId'));
	assert.equal(movedScene.layers.find(layer => layer.id === createdId).transform.x, 0.25);
	actions.duplicateEditorLayer({ store: harness.store });
	const duplicateId = harness.store.get('selectedLayerId');
	assert.notEqual(duplicateId, createdId);
	assert.equal(getStudioScene(harness.store.get('movie'), harness.store.get('selectedSceneId')).layers.length, countBefore + 2);
	actions.deleteEditorLayer({ store: harness.store });
	assert.equal(getStudioScene(harness.store.get('movie'), harness.store.get('selectedSceneId')).layers.length, countBefore + 1);
	assert.ok(harness.renderCount() >= 4);
	assert.match(harness.store.get('jsonDraft'), /shape2d/);
	for (const action of ['createEditorLayer', 'nudgeLayerTransform', 'duplicateEditorLayer', 'deleteEditorLayer']) {
		assert.equal(action in harness.editorActions, false, `${action} must not duplicate lazily`);
	}
});
test('eager editor UI state keeps tool, viewport, panel, and snap independent from movie schema', () => {
	const harness = createEditorHarness();
	const actions = harness.shellActions;
	actions.selectEditorTool({ event: eventWithDataset({ editorTool: 'rotate' }), store: harness.store });
	actions.selectViewportMode({ event: eventWithDataset({ viewportMode: '3d' }), store: harness.store });
	actions.openEditorPanel({ event: eventWithDataset({ editorPanel: 'procedural' }), store: harness.store });
	actions.toggleEditorSnap({ store: harness.store });
	assert.equal(harness.store.get('activeTool'), 'rotate');
	assert.equal(harness.store.get('viewportMode'), '3d');
	assert.equal(harness.store.get('activePanel'), 'procedural');
	assert.equal(harness.store.get('mobilePanelOpen'), true);
	assert.equal(harness.store.get('snapEnabled'), true);
	assert.equal('activeTool' in harness.store.get('movie'), false);
});
