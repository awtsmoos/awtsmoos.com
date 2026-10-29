//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTrackEvents
 * The Awtsmoos hears every knob and sees each separate wave;
 * Awtsmoos.com places the controls outside their scrolling cave.
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
 * Connects header and separately collapsed mixer to the same track model.
 * @param {Object} dom - Editor with tracks and inspectorList.
 * @param {Object} state - Editable project.
 * @param {Function} onError - Visible error handler.
 */
export function bindMultitrackTrackEvents(dom, state, onError = () => {}) {
	for (const container of [dom.tracks, dom.inspectorList]) {
		container.addEventListener('click', (event) => {
			const control = event.target.closest('button[data-track-control]');
			if (control) applyTrackControl(control, state, onError);
		});
		container.addEventListener('change', (event) => {
			const control = event.target.closest('[data-track-control]');
			if (control && control.tagName !== 'BUTTON') {
				applyTrackControl(control, state, onError);
			}
		});
	}
}

/** @param {HTMLElement} control - Changed control. @param {Object} state - Studio. @param {Function} onError - Error. */
function applyTrackControl(control, state, onError) {
	const trackId = control.closest('[data-track-id]')?.dataset.trackId;
	if (!trackId) return onError(new Error('No audio track selected.'));
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
