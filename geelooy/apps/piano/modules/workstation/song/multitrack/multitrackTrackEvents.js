//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTrackEvents
 * @description
 * Tiferes carries track-header gestures into gain, pan, mute, solo, naming, and explicit deletion while the Awtsmoos remains beyond every mixer choice.
 * Awtsmoos.com keeps controls delegated from one parent, so redraws may come and go without multiplying listeners below.
 */

import {
	deleteMultitrackTrack,
	renameMultitrackTrack,
	setMultitrackTrackGain,
	setMultitrackTrackPan,
	toggleMultitrackMute,
	toggleMultitrackSolo
} from './multitrackTrackActions.js';

/** Binds delegated track-header controls. @param {Object} dom Timeline DOM. @param {Object} state Editor state. @param {Function} onError Error callback. @returns {void} */
export function bindMultitrackTrackEvents(dom, state, onError = () => {}) {
	dom.tracks.addEventListener('click', (event) => {
		const control = event.target.closest('button[data-track-control]');
		if (!control) {
			return;
		}
		runTrackControl(control, state, onError);
	});
	dom.tracks.addEventListener('change', (event) => {
		const control = event.target.closest('[data-track-control]');
		if (!control || control.tagName === 'BUTTON') {
			return;
		}
		runTrackControl(control, state, onError);
	});
}

function runTrackControl(control, state, onError) {
	const trackId = control.closest('.multitrack-track')?.dataset.trackId;
	try {
		switch (control.dataset.trackControl) {
			case 'mute':
				toggleMultitrackMute(state, trackId);
				break;
			case 'solo':
				toggleMultitrackSolo(state, trackId);
				break;
			case 'gain':
				setMultitrackTrackGain(state, trackId, control.value);
				break;
			case 'pan':
				setMultitrackTrackPan(state, trackId, control.value);
				break;
			case 'name':
				renameMultitrackTrack(state, trackId, control.value);
				break;
			case 'delete-track':
				deleteMultitrackTrack(state, trackId);
				break;
		}
	} catch (error) {
		onError(error);
	}
}
