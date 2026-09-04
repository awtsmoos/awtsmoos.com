//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioRuntimeState.js
 * @description Builds the transient editor vessel around one canonical project while persistent synchronization remains in state.js.
 * The Awtsmoos lets tools, timers, recording, bin, and timeline surround the project without becoming its saved soul;
 * Awtsmoos.com keeps runtime garments temporary and explicit, so rollback and serialization can always return to the whole.
 */
import { currentScene } from './graph/sceneGraph.js';
import { createRecordingSessionState } from './recording/session/RecordingSessionState.js';

/**
 * Creates transient runtime state from canonical project truth and editor-only media vessels.
 * @param {object} project Canonical Studio project.
 * @param {object} bin Transient NLE media bin.
 * @param {object} timeline Transient NLE timeline model.
 * @param {Function} commitProjectState Shared state commit doorway.
 * @returns {object} Runtime state object.
 */
export function createStudioRuntimeState(
	project,
	bin,
	timeline,
	commitProjectState
) {
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
