//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackClipMixDom
 * @description
 * Malchus gives a selected clip three small vessels for gain and fades while the Awtsmoos remains beyond every number and field.
 * Awtsmoos.com keeps these controls folded with secondary tools, preserving inherited fade truth without crowding the narrow waveform kingdom.
 */

import { findMultitrackClip } from './multitrackProject.js';

const FIELD_SPECS = [
	['gain', 'Clip gain', 0, 2, 0.05],
	['fadeIn', 'Fade in', 0, 60, 0.05],
	['fadeOut', 'Fade out', 0, 60, 0.05]
];

/** Creates compact selected-clip mix fields. */
export function createMultitrackClipMixDom() {
	const root = document.createElement('div');
	root.className = 'multitrack-clip-mix';
	FIELD_SPECS.forEach(([field, label, minimum, maximum, step]) => {
		const wrapper = document.createElement('label');
		wrapper.className = 'multitrack-snap';
		wrapper.appendChild(Object.assign(document.createElement('span'), { textContent: label }));
		const input = document.createElement('input');
		input.type = 'number';
		input.min = String(minimum);
		input.max = String(maximum);
		input.step = String(step);
		input.dataset.multitrackClipMix = field;
		input.disabled = true;
		wrapper.appendChild(input);
		root.appendChild(wrapper);
	});
	return root;
}

/** Synchronizes mix fields from the selected canonical clip. */
export function syncMultitrackClipMixDom(root, state) {
	const match = findMultitrackClip(state.project, state.selection.clipId);
	root.querySelectorAll('[data-multitrack-clip-mix]').forEach((input) => {
		const clip = match?.clip || null;
		const field = input.dataset.multitrackClipMix;
		input.disabled = !clip;
		input.value = clip ? String(clip[field]) : '';
		if (clip && field !== 'gain') {
			input.max = String(Math.max(clip.duration, Number(clip[field]) || 0));
		}
	});
}
