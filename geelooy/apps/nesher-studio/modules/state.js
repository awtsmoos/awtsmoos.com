//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file state.js
 * @description Creates the critical editor state without importing Timeline machinery, then synchronizes persistent project aliases in either direction.
 * The Awtsmoos lets the project awaken before every editing chamber has taken form;
 * Awtsmoos.com keeps NLE vessels unborn until Timeline is requested, while project truth remains one through every storm.
 */
import { makeScene } from './graph/sceneGraph.js';
import {
	addProjectAsset,
	addProjectSequence,
	commitProject,
	createProject
} from './project/Project.js';
import { createStudioRuntimeState } from './StudioRuntimeState.js';

/** Creates the lightweight transient editor vessel around one canonical project. */
export function createState() {
	const firstScene = makeScene('scene-main', 'Scene 1');
	const project = createProject({
		scenes: [firstScene],
		width: 1280,
		height: 720,
		fps: 30
	});

	addProjectAsset(project, {
		id: 'asset-canvas',
		name: 'Opening scene',
		mediaKind: 'generated',
		duration: 4
	});
	addProjectSequence(project, {
		id: 'sequence-main',
		name: 'Sequence 1'
	});
	project.currentSequenceId = 'sequence-main';

	const state = createStudioRuntimeState(
		project,
		null,
		null,
		commitProjectState
	);
	state.exportPlan = null;
	commitProjectState(state, 'initial state');
	return state;
}

/** Synchronizes persistent editor aliases into canonical project truth. */
export function syncProjectFromState(state) {
	state.project.width = state.width;
	state.project.height = state.height;
	state.project.fps = state.fps;
	state.project.scenes = state.scenes;
	state.project.currentSceneId = state.currentSceneId;
	state.project.streaming.providerId = state.providerId;
	state.project.selection.sourceId = state.selectedId;
	return state.project;
}

/** Restores persistent editor aliases from canonical project truth after rollback or undo. */
export function syncStateFromProject(state) {
	state.width = state.project.width;
	state.height = state.project.height;
	state.fps = state.project.fps;
	state.scenes = state.project.scenes;
	state.currentSceneId = state.project.currentSceneId;
	state.providerId = state.project.streaming.providerId;
	state.selectedId = state.project.selection.sourceId || null;
	return state;
}

/** Preserves the legacy commit doorway used by existing editor controllers. */
export function commitProjectState(state, label = 'change') {
	syncProjectFromState(state);
	commitProject(state.project, label);
	return state;
}

export { makeScene, currentScene } from './graph/sceneGraph.js';

/** Creates a readable runtime identity for transient editor entities. */
export function nextId(prefix) {
	return `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now()}`;
}
