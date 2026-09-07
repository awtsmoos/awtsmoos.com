//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCommandPaletteActions.js
 * @description Routes search, creation, workspace, and editor intentions through canonical movie mutations while creation may bridge dimensional modes.
 * The Awtsmoos renews intention before menu or shortcut gives it a name; Awtsmoos.com keeps every creation on one movie path,
 * letting flat additions reveal Hybrid above depth and native world additions reopen 3D when the maker returns from a planar map.
 */

import { cloneStudioSelection, createStudioLayerId, getStudioScene } from '../editor/StudioLayerAccess.js';
import { commitStudioEditorMovie } from '../editor/StudioEditorCommit.js';
import { createStudioLayer } from '../editor/StudioLayerFactory.js';
import { selectModeForCreatedKind } from '../editor/StudioCreateMode.js';
import { createStudioCoreOperationParams, getStudioCoreOperation } from '../editor/core/StudioCoreOperationRuntime.js';
import { STUDIO_KEYFRAME_CHANNELS, getStudioChannelValue, studioLayerLocalTime, upsertStudioKeyframe } from '../timeline/StudioKeyframeAccess.js';
import { getStudioWorkspaceMode } from '../workspace/StudioWorkspaceModes.js';

/** Build the deeper command-palette action family around the shared movie session. */
export function createStudioCommandPaletteActions(session) {
	return {
		openCommandPalette({ store }) {
			store.update(state => {
				state.commandPaletteOpen = true;
				state.commandQuery = '';
			});
		},
		closeCommandPalette({ store }) {
			store.set('commandPaletteOpen', false);
		},
		updateCommandQuery({ event, store }) {
			store.set('commandQuery', event.currentTarget.value);
		},
		executeStudioCommand({ event, store }) {
			const type = event.currentTarget.dataset.commandType;
			const value = event.currentTarget.dataset.commandValue;
			executeCommand(session, store, type, value);
			store.set('commandPaletteOpen', false);
		}
	};
}

/** Route one declarative command into the established canonical mutation path. */
function executeCommand(session, store, type, value) {
	if (type === 'workspace') return selectWorkspace(store, value);
	if (type === 'panel') return store.set('activePanel', value);
	if (type === 'create') return createLayer(session, store, value);
	if (type === 'core') return selectCore(store, value);
	if (type === 'editor' && value === 'duplicate') return duplicateLayer(session, store);
	if (type === 'editor' && value === 'delete') return deleteLayer(session, store);
	if (type === 'editor' && value === 'keyframe-all') return keyframeLayer(session, store);
}

/** Project a professional workspace without polluting MovieDocument with editor-only state. */
function selectWorkspace(store, id) {
	const mode = getStudioWorkspaceMode(id);
	store.update(state => {
		state.workspaceMode = mode.id;
		state.activePanel = mode.panel;
		state.viewportMode = mode.viewport;
		state.timelineExpanded = mode.timelineExpanded;
	});
}

/** Create one canonical layer, commit it, select it, then reveal the dimensional mode required to see it. */
function createLayer(session, store, kind) {
	const movie = structuredClone(store.get('movie'));
	const scene = getStudioScene(movie, store.get('selectedSceneId'));
	if (!scene) return;
	const layer = createStudioLayer(movie, scene, kind);
	scene.layers.push(layer);
	commitStudioEditorMovie(session, store, movie, {
		selectedLayerId: layer.id,
		status: `${layer.kind} created.`
	});
	selectModeForCreatedKind(store, kind);
}

function duplicateLayer(session, store) {
	const selection = cloneStudioSelection(store.get('movie'), store.get('selectedSceneId'), store.get('selectedLayerId'));
	if (!selection.scene || !selection.layer) return;
	const copy = structuredClone(selection.layer);
	copy.id = createStudioLayerId(selection.movie, `${selection.layer.id}-copy`);
	selection.scene.layers.push(copy);
	commitStudioEditorMovie(session, store, selection.movie, { selectedLayerId: copy.id, status: `${selection.layer.id} duplicated.` });
}

function deleteLayer(session, store) {
	const selection = cloneStudioSelection(store.get('movie'), store.get('selectedSceneId'), store.get('selectedLayerId'));
	if (!selection.scene || !selection.layer) return;
	selection.scene.layers = selection.scene.layers.filter(layer => layer.id !== selection.layer.id);
	commitStudioEditorMovie(session, store, selection.movie, { selectedLayerId: selection.scene.layers[0]?.id || null, status: `${selection.layer.id} deleted.` });
}

function keyframeLayer(session, store) {
	const selection = cloneStudioSelection(store.get('movie'), store.get('selectedSceneId'), store.get('selectedLayerId'));
	if (!selection.scene || !selection.layer) return;
	const at = studioLayerLocalTime(store.get('playhead'), selection.scene, selection.layer);
	for (const channel of STUDIO_KEYFRAME_CHANNELS) {
		upsertStudioKeyframe(selection.layer, channel, at, getStudioChannelValue(selection.layer, channel));
	}
	commitStudioEditorMovie(session, store, selection.movie, { status: `${selection.layer.id} transform keyframed.` });
}

function selectCore(store, id) {
	const operation = getStudioCoreOperation(id);
	store.update(state => {
		state.activePanel = 'procedural';
		state.selectedCoreOperationId = id;
		state.coreOperationParams = createStudioCoreOperationParams(operation);
	});
}
