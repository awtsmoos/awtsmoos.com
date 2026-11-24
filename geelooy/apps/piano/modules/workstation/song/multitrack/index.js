//B"H
/** The Awtsmoos keeps every instrument visible as pinch and playback flow. */
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
import { bindMultitrackNleControls } from './multitrackNleControls.js';
import { bindMultitrackDspControls } from './multitrackDspControls.js';
import { bindMultitrackLoopControls } from './multitrackLoopControls.js';
import { registerMultitrackExportRoot } from './multitrackExportProgress.js';
import { bindMultitrackMeters } from './multitrackMeterControls.js';
import { bindPianoRoll } from './multitrackPianoRoll.js';
import { bindFreezeBusControls } from './multitrackFreezeControls.js';
import { bindMarkerControls } from './multitrackMarkerControls.js';

let workstation = null;

/** Mounts one audio editor with a shared project and history. */
export function initMultitrackWorkstation(songDom, songState) {
	if (workstation) return workstation;
	const dom = createMultitrackTimelineDom();
	const editorRoom = songDom.editor.closest('.song-studio-editor-room');
	songDom.panel.insertBefore(dom.root, editorRoom);
	registerMultitrackExportRoot(dom.root);
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
	bindMultitrackNleControls(dom, multitrackStudioState);
	bindMultitrackDspControls(dom, multitrackStudioState);
	bindMultitrackLoopControls(dom, multitrackStudioState);
	bindMultitrackMeters(dom, multitrackStudioState);
	dom.root.insertBefore(bindMarkerControls(multitrackStudioState, time => multitrackStudioState.setPlayhead(time)), dom.inspector);
	dom.root.insertBefore(bindPianoRoll(multitrackStudioState), dom.inspector);
	dom.root.insertBefore(bindFreezeBusControls(multitrackStudioState), dom.inspector);
	workstation = { dom, state: multitrackStudioState };
	return workstation;
}

export function getMultitrackWorkstation() { return workstation; }
