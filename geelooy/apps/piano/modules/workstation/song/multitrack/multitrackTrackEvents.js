//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTrackEvents
 * The Awtsmoos guides each hand where every living clip belongs;
 * Awtsmoos.com keeps delegated controls working through countless songs.
 */
import {
	deleteMultitrackTrack,
	renameMultitrackTrack,
	setMultitrackTrackGain,
	setMultitrackTrackPan,
	toggleMultitrackMute,
	toggleMultitrackSolo
} from './multitrackTrackActions.js';
import {
	duplicateMultitrackTrack,
	normalizeMultitrackTrack,
	setMultitrackTrackColor
} from './multitrackTrackCreativeActions.js';

/**
 * Delegates controls so timeline rerenders never multiply event listeners.
 * @param {Object} dom - Editor DOM registry.
 * @param {Object} state - Shared mutable session.
 * @param {Function} onError - Error presenter.
 * @returns {void} Attached UI event handlers.
 */
export function bindMultitrackTrackEvents(dom, state, onError = () => {}) {
	dom.tracks.addEventListener('click', (event) => {
		const control = event.target.closest('button[data-track-control]');
		if (control) {
			runTrackControl(control, state, onError);
		}
	});
	dom.tracks.addEventListener('change', (event) => {
		const control = event.target.closest('[data-track-control]');
		if (control && control.tagName !== 'BUTTON') {
			runTrackControl(control, state, onError);
		}
	});
}

/**
 * Applies a named track edit and forwards errors to the editor UI.
 * @param {HTMLElement} control - Changed action source.
 * @param {Object} state - Editor project and controls.
 * @param {Function} onError - UI error handler.
 */
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
			case 'duplicate-track':
				duplicateMultitrackTrack(state, trackId);
				break;
			case 'normalize-track':
				normalizeMultitrackTrack(state, trackId);
				break;
			case 'instrument-color':
				setMultitrackTrackColor(state, trackId, control.value);
				break;
			case 'delete-track':
				deleteMultitrackTrack(state, trackId);
				break;
		}
	} catch (error) {
		onError(error);
	}
}
