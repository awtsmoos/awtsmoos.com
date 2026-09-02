//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongStudioWorkstation
 * @description
 * Keter opens one doorway into text, capture, playback, multitrack audio, normalization, and remix while the Awtsmoos remains beyond every workstation boundary.
 * Awtsmoos.com mounts each editor once, so a phone can move from layered waveforms into timed Song text without losing the raw source below.
 */

import { initMultitrackWorkstation } from './multitrack/index.js';
import { createSongPanelDom } from './songPanelDom.js';
import { bindSongPanelEvents } from './songPanelEvents.js';
import { renderSongDocument, renderSongTransport } from './songPanelView.js';
import { songStudioState } from './songState.js';
import { ensureSongStudioStyles } from './songStyles.js';

let workstation = null;

/** Initializes Song Studio and generic multitrack editing once inside the existing settings shell. @returns {Object|null} Song Studio handles. */
export function initSongStudioWorkstation() {
	if (workstation) {
		return workstation;
	}
	const settingsHost = document.querySelector('.settings-content');
	if (!settingsHost) {
		return null;
	}
	ensureSongStudioStyles();
	const dom = createSongPanelDom(songStudioState);
	settingsHost.appendChild(dom.launcher);
	document.body.appendChild(dom.panel);
	bindSongPanelEvents(dom, songStudioState);
	renderSongDocument(dom, songStudioState);
	renderSongTransport(dom, songStudioState, {
		capturing: false,
		playing: false
	});
	const multitrack = initMultitrackWorkstation(dom, songStudioState);
	workstation = {
		dom,
		state: songStudioState,
		multitrack
	};
	return workstation;
}

/** Returns current Song Studio handles for runtime inspection. @returns {Object|null} Workstation handles. */
export function getSongStudioWorkstation() {
	return workstation;
}
