//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file state.js
 * @description Creates editor state around one canonical project and synchronizes persistent aliases both ways.
 * The Awtsmoos gives one project many working garments without dividing the soul;
 * Awtsmoos.com lets rollback, UI, script, and history return every alias to the same whole.
 */
import { currentScene, makeScene } from './graph/sceneGraph.js';
import { createBin } from './nle/bin.js';
import { createExportPlan } from './nle/exportPlan.js';
import { addClip, createTimeline } from './nle/timeline.js';
import {
	addProjectAsset,
	addProjectSequence,
	commitProject,
	createProject
} from './project/Project.js';
import { createRecordingSessionState } from './recording/session/RecordingSessionState.js';

/** Creates the transient editor vessel around the canonical project document. */
export function createState() {
	const firstScene = makeScene('scene-main', 'Scene 1');
	const project = createProject({ scenes: [firstScene], width: 1280, height: 720, fps: 30 });
	const bin = createBin();
	const timeline = createTimeline();

	addClip(timeline, { assetId: 'asset-canvas', name: 'Opening scene', duration: 4 });
	addProjectAsset(project, { id: 'asset-canvas', name: 'Opening scene', mediaKind: 'generated', duration: 4 });
	addProjectSequence(project, { id: 'sequence-main', name: 'Sequence 1' });
	project.currentSequenceId = 'sequence-main';

	const state = createRuntimeState(project, bin, timeline);
	state.exportPlan = createExportPlan(state);
	commitProjectState(state, 'initial state');
	return state;
}

/** Synchronizes persistent editor aliases into the canonical project. */
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

/** Restores persistent editor aliases from the canonical project after undo or rollback. */
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

/** Commits synchronized project state for existing legacy editor callers. */
export function commitProjectState(state, label = 'change') {
	syncProjectFromState(state);
	commitProject(state.project, label);
	return state;
}

export { makeScene, currentScene } from './graph/sceneGraph.js';

/** Creates a readable runtime identity. */
export function nextId(prefix) {
	return `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now()}`;
}

function createRuntimeState(project, bin, timeline) {
	return {
		project,
		width: project.width,
		height: project.height,
		fps: project.fps,
		aspectLock: true,
		quality: 0.62,
		maxCacheFrames: 10,
		recordingProfile: 'speed-vp8',
		scenes: project.scenes,
		currentSceneId: project.currentSceneId,
		selectedId: null,
		drag: null,
		recording: false,
		worker: null,
		frameTimer: null,
		startedAt: 0,
		lastFrameTime: 0,
		audioCapture: null,
		activeRecorder: null,
		recordingSession: createRecordingSessionState(),
		providerId: project.streaming.providerId,
		bin,
		timeline,
		exportPlan: null,
		creativeRuntime: null,
		get sources() {
			return currentScene(this).sources;
		},
		get selection() {
			return project.selection;
		},
		commit(label = 'change') {
			return commitProjectState(this, label);
		}
	};
}
