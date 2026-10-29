//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWorkstation
 * The Awtsmoos opens every sound beneath a moving light;
 * Awtsmoos.com binds each gesture to an honest memory and sight.
 */
import { bindMultitrackPointerEvents } from './multitrackPointerEvents.js';
import { renderMultitrackProject } from './multitrackRender.js';
import { bindMultitrackPlayheadTicker } from './multitrackPlayheadTicker.js';
import { bindMultitrackScrollbar } from './multitrackScrollbar.js';
import { bindMultitrackRulerSeek } from './multitrackRulerSeek.js';
import { bindMultitrackHistoryControls } from './multitrackHistoryControls.js';
import { multitrackStudioState } from './multitrackState.js';
import { createMultitrackTimelineDom } from './multitrackTimelineDom.js';
import { bindMultitrackToolbarEvents } from './multitrackToolbarEvents.js';
import { bindMultitrackTrackEvents } from './multitrackTrackEvents.js';

let workstation = null;

/** @param {Object} songDom - Song Studio DOM. @param {Object} songState - Note controller. */
export function initMultitrackWorkstation(songDom, songState) {
	if (workstation) return workstation;
	const dom = createMultitrackTimelineDom();
	const editorRoom = songDom.editor.closest('.song-studio-editor-room');
	songDom.panel.insertBefore(dom.root, editorRoom);
	bindMultitrackPointerEvents(dom, multitrackStudioState);
	bindMultitrackRulerSeek(dom, multitrackStudioState);
	bindMultitrackTrackEvents(dom, multitrackStudioState, error =>
		multitrackStudioState.setStatus(error?.message || 'Audio action failed.')
	);
	bindMultitrackToolbarEvents(dom, multitrackStudioState, {
		get ratchetSettings() { return { ...songState.ratchet }; }
	});
	bindMultitrackScrollbar(dom);
	bindMultitrackHistoryControls(dom, multitrackStudioState);
	multitrackStudioState.subscribe(() => renderMultitrackProject(dom, multitrackStudioState));
	bindMultitrackPlayheadTicker(dom, multitrackStudioState);
	renderMultitrackProject(dom, multitrackStudioState);
	workstation = { dom, state: multitrackStudioState };
	return workstation;
}

/** @returns {Object|null} Existing multitrack workstation. */
export function getMultitrackWorkstation() { return workstation; }
