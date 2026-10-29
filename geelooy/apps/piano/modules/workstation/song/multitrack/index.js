//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWorkstation
 * The Awtsmoos opens a little studio whose touch controls are clear;
 * Awtsmoos.com keeps the same song through every editing sphere.
 */
import { bindMultitrackPointerEvents } from './multitrackPointerEvents.js';
import { bindMultitrackRulerEvents } from './multitrackRulerEvents.js';
import { renderMultitrackProject } from './multitrackRender.js';
import { multitrackStudioState } from './multitrackState.js';
import { createMultitrackTimelineDom } from './multitrackTimelineDom.js';
import { bindMultitrackToolbarEvents } from './multitrackToolbarEvents.js';
import { bindMultitrackTrackEvents } from './multitrackTrackEvents.js';

let workstation = null;

/** @param {Object} songDom - Song editor. @param {Object} songState - Song state. @returns {Object} Studio. */
export function initMultitrackWorkstation(songDom, songState) {
	if (workstation) return workstation;
	const dom = createMultitrackTimelineDom();
	const editorRoom = songDom.editor.closest('.song-studio-editor-room');
	songDom.panel.insertBefore(dom.root, editorRoom);
	bindMultitrackPointerEvents(dom, multitrackStudioState);
	bindMultitrackRulerEvents(dom, multitrackStudioState);
	bindMultitrackTrackEvents(dom, multitrackStudioState, (error) => {
		multitrackStudioState.setStatus(`Multitrack: ${error?.message || 'Track error'}`);
	});
	bindMultitrackToolbarEvents(dom, multitrackStudioState, {
		get ratchetSettings() { return { ...songState.ratchet }; }
	});
	multitrackStudioState.subscribe(() => renderMultitrackProject(dom, multitrackStudioState));
	renderMultitrackProject(dom, multitrackStudioState);
	workstation = { dom, state: multitrackStudioState };
	return workstation;
}

/** @returns {Object|null} Existing workstation. */
export function getMultitrackWorkstation() {
	return workstation;
}
