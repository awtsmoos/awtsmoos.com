//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWorkstation
 * @description
 * Keter opens the generic audio timeline inside Song Studio while the Awtsmoos remains beyond text, waveform, layer, and editor.
 * Awtsmoos.com lets ordinary audio and specialized remix tools share one mobile palace, each responsibility kept in a smaller vessel with a clearer voice.
 */

import { bindMultitrackPointerEvents } from './multitrackPointerEvents.js';
import { renderMultitrackProject } from './multitrackRender.js';
import { multitrackStudioState } from './multitrackState.js';
import { createMultitrackTimelineDom } from './multitrackTimelineDom.js';
import { bindMultitrackToolbarEvents } from './multitrackToolbarEvents.js';
import { bindMultitrackTrackEvents } from './multitrackTrackEvents.js';

let workstation = null;

/**
 * Mounts the generic multitrack editor into Song Studio exactly once.
 * @param {Object} songDom Song Studio DOM registry.
 * @param {Object} songState Song Studio state carrying shared ratchet settings.
 * @returns {Object} Multitrack workstation handles.
 */
export function initMultitrackWorkstation(songDom, songState) {
	if (workstation) {
		return workstation;
	}
	const dom = createMultitrackTimelineDom();
	const editorRoom = songDom.editor.closest('.song-studio-editor-room');
	songDom.panel.insertBefore(dom.root, editorRoom);
	bindMultitrackPointerEvents(dom, multitrackStudioState);
	bindMultitrackTrackEvents(dom, multitrackStudioState, (error) => {
		multitrackStudioState.setStatus(`Multitrack: ${error?.message || 'Track error'}`);
	});
	bindMultitrackToolbarEvents(dom, multitrackStudioState, {
		get ratchetSettings() {
			return { ...songState.ratchet };
		}
	});
	multitrackStudioState.subscribe(() => {
		renderMultitrackProject(dom, multitrackStudioState);
	});
	renderMultitrackProject(dom, multitrackStudioState);
	workstation = { dom, state: multitrackStudioState };
	return workstation;
}

/** Returns mounted multitrack editor handles. @returns {Object|null} Workstation handles. */
export function getMultitrackWorkstation() {
	return workstation;
}
