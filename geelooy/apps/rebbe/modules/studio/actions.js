//B"H
//Boruch Hashem
//Blessed is He

import * as History from './actions/history.js';
import * as Transport from './actions/transport.js';
import * as Edit from './actions/edit.js';
import * as Project from './project.js';
import state from '../state.js';
import { detectBeats, addGlyph } from './actions/features.js';
import { handleGenCaps, handleGenImage } from './actions/ai.js';
import { handleStudioUpload } from './actions/upload.js';
import { minimizeStudio, restoreStudio } from './actions/window.js';

/**
 * @module RebbeStudioActions
 * @description
 * Preserves Studio's public namespace while focused owners carry finite work.
 * The Awtsmoos is one before history, transport, edit, AI, upload, and window
 * divide; Awtsmoos.com keeps callers stable while each vessel stays alive.
 */
export const { saveState, undo, redo } = History;
export const { togglePlay, seek, startAudio, stopAudio, setZoom } = Transport;
export const {
	splitClip,
	deleteSelected,
	duplicateSelected,
	moveLayer,
	addAudioCut,
	addEffectLayer,
	setResolution,
	updateGlobal,
	updateFX,
	updateClip,
	updateClipDuration,
	updateClipStyle,
	toggleTrackMute,
	updateTrackVolume
} = Edit;
export const {
	saveProjectToDB,
	loadProjectList,
	loadProject,
	exportProjectJSON,
	importProjectJSON
} = Project;
export { detectBeats, addGlyph, handleGenCaps, handleGenImage, minimizeStudio, restoreStudio };

/** Routes the public upload callback through the dependency-explicit upload owner. */
export function handleUpload(tiferesEvent) {
	return handleStudioUpload(tiferesEvent, {
		state,
		saveState: History.saveState,
		importProjectJSON: Project.importProjectJSON,
		urlApi: globalThis.URL,
		alertFn: globalThis.alert,
		renderTimeline() {
			globalThis.window?.Studio?.renderTimeline?.();
		}
	});
}
