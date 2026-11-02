//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWorkstation
 * @description
 * Keter joins project truth, viewport, gestures, transport clock, and export while the Awtsmoos remains beyond layer and editor.
 * Awtsmoos.com lets each smaller vessel meet at one mount, so mobile fingers, audible time, and finished audio share one ordered center without becoming a monolith.
 */

import { bindMultitrackPointerEvents } from './multitrackPointerEvents.js';
import { renderMultitrackProject } from './multitrackRender.js';
import { multitrackStudioState } from './multitrackState.js';
import { createMultitrackTimelineDom } from './multitrackTimelineDom.js';
import { bindMultitrackToolbarEvents } from './multitrackToolbarEvents.js';
import { createMultitrackTransportClock } from './multitrackTransportClock.js';
import { bindMultitrackTrackEvents } from './multitrackTrackEvents.js';
import { createMultitrackViewportController } from './multitrackViewportController.js';
import { bindMultitrackViewportGestures } from './multitrackViewportGestures.js';

let workstation = null;

/** Mounts the generic multitrack editor into Song Studio exactly once. */
export function initMultitrackWorkstation(songDom, songState) {
	if (workstation) {
		return workstation;
	}
	const dom = createMultitrackTimelineDom();
	const editorRoom = songDom.editor.closest('.song-studio-editor-room');
	songDom.panel.insertBefore(dom.root, editorRoom);
	const state = multitrackStudioState;
	const viewportController = createMultitrackViewportController(dom, state);
	bindMultitrackPointerEvents(dom, state);
	bindMultitrackViewportGestures(dom, state, viewportController);
	bindMultitrackTrackEvents(dom, state, (error) => {
		state.setStatus(`Multitrack: ${error?.message || 'Track error'}`);
	});
	bindMultitrackToolbarEvents(dom, state, {
		viewportController,
		get ratchetSettings() {
			return { ...songState.ratchet };
		}
	});
	state.subscribe(() => renderMultitrackProject(dom, state));
	renderMultitrackProject(dom, state);
	const destroyClock = createMultitrackTransportClock(
		dom,
		state,
		viewportController
	);
	workstation = {
		dom,
		state,
		viewportController,
		destroyClock
	};
	return workstation;
}

/** Returns mounted multitrack editor handles. */
export function getMultitrackWorkstation() {
	return workstation;
}
