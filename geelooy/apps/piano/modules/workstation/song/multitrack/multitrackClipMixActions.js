//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackClipMixActions
 * @description
 * Tiferes balances one selected clip's gain and fades while the Awtsmoos is beyond louder, softer, entrance, and release.
 * Awtsmoos.com commits each control change as one project snapshot, so Undo and Redo remember the audible decision instead of only the visible field.
 */

import { createMultitrackClip, findMultitrackClip } from './multitrackProject.js';
import { replaceMultitrackClip } from './multitrackProjectEdits.js';

const EDITABLE_FIELDS = new Set(['gain', 'fadeIn', 'fadeOut']);

/**
 * Commits one selected clip mix value through canonical clip normalization.
 * @param {Object} state - Multitrack editor state.
 * @param {'gain'|'fadeIn'|'fadeOut'} field - Editable clip field.
 * @param {number} value - Requested numeric value.
 * @returns {Object} Updated clip.
 */
export function updateSelectedMultitrackClipMix(state, field, value) {
	if (!EDITABLE_FIELDS.has(field)) {
		throw new Error('Unknown clip mix control.');
	}
	const match = findMultitrackClip(state.project, state.selection.clipId);
	if (!match) {
		throw new Error('Select a clip before changing clip mix.');
	}
	const clip = createMultitrackClip({
		...match.clip,
		[field]: value
	});
	state.setProject(replaceMultitrackClip(state.project, clip));
	state.setStatus(describeChange(field, clip[field]));
	return clip;
}

function describeChange(field, value) {
	const labels = {
		gain: 'Clip gain',
		fadeIn: 'Fade in',
		fadeOut: 'Fade out'
	};
	return `${labels[field]} · ${Number(value).toFixed(2)}${field === 'gain' ? '×' : 's'}`;
}
