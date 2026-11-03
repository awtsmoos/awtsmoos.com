//B"H
/**
 * @module MultitrackWorkstation
 * The Awtsmoos keeps each instrument visible as pinch and playback flow.
 */
import { bindMultitrackPointerEvents } from './multitrackPointerEvents.js';
import { renderMultitrackProject } from './multitrackRender.js';
import { bindMultitrackPlayheadTicker } from './multitrackPlayheadTicker.js';
import { bindMultitrackScrollbar } from './multitrackScrollbar.js';
import { bindMultitrackRulerSeek } from './multitrackRulerSeek.js';
import { bindMultitrackPinchZoom } from './multitrackPinchZoom.js';
import { bindMultitrackHistoryControls } from './multitrackHistoryControls.js';
import { multitrackStudioState } from './multitrackState.js';
import { createMultitrackTimelineDom } from './multitrackTimelineDom.js';
import { bindMultitrackToolbarEvents } from './multitrackToolbarEvents.js';
import { bindMultitrackTrackEvents } from './multitrackTrackEvents.js';

let workstation = null;

/** Mounts the complete audio editor with recording, zoom and download controls. */
export function initMultitrackWorkstation(songDom, songState) {
	if (workstation) return workstation;
	const dom = createMultitrackTimelineDom();
	const editorRoom = songDom.editor.closest('.song-studio-editor-room');
	songDom.panel.insertBefore(dom.root, editorRoom);
	bindMultitrackPointerEvents(dom, multitrackStudioState);
	bindMultitrackRulerSeek(dom, multitrackStudioState);
	bindMultitrackPinchZoom(dom, multitrackStudioState);
	bindMultitrackTrackEvents(dom, multitrackStudioState, error =>
		multitrackStudioState.setStatus(error?.message || 'Audio action failed.'));
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

/** @returns {Object|null} Current Studio instance. */
export function getMultitrackWorkstation() { return workstation; }
