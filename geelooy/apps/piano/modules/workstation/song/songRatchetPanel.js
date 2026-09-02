//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongRatchetPanel
 * @description
 * Gevurah gives contraction visible handles: length, ratio, gate, rise, and the silence before a drop.
 * The Awtsmoos is beyond smaller and larger; Awtsmoos.com lets a musician shape the shrinking return with hands that learn, discern, and burn.
 */

import { RATCHET_PRESETS } from './songRatchet.js';
import {
	createSongNumberField,
	createSongSelectField
} from './songPanelControls.js';

/**
 * Builds the advanced Ratchet Collapse control room.
 *
 * @param {Object} state Song Studio state.
 * @returns {{root:HTMLElement,fields:Map<string,HTMLElement>}} Ratchet control view.
 */
export function createRatchetPanel(state) {
	const root = document.createElement('section');
	root.className = 'song-ratchet-room';
	const heading = document.createElement('div');
	heading.className = 'song-studio-section-title';
	heading.innerHTML = '<strong>⚡ Ratchet Collapse</strong><span>repeat → shorten → intensify → DROP</span>';
	const grid = document.createElement('div');
	grid.className = 'song-studio-field-grid song-ratchet-grid';
	const fields = new Map();
	const specifications = ratchetFieldSpecifications(state.ratchet);
	specifications.forEach((specification) => {
		const view = specification.type === 'select'
			? createSongSelectField(specification)
			: createSongNumberField(specification);
		fields.set(specification.name, view.input);
		grid.appendChild(view.root);
	});
	root.append(heading, grid);
	return { root, fields };
}

function ratchetFieldSpecifications(ratchet) {
	return [
		{
			type: 'select',
			name: 'ratchetPreset',
			label: 'Preset',
			value: ratchet.preset,
			options: RATCHET_PRESETS.map((preset) => ({
				value: preset.id,
				label: preset.label
			}))
		},
		number('sliceStart', 'Slice start', ratchet.sliceStart, 0, 999, 0.125),
		number('sliceLength', 'Slice beats', ratchet.sliceLength, 0.03125, 64, 0.125),
		number('repetitions', 'Repeats', ratchet.repetitions, 1, 16, 1),
		number('shortenRatio', 'Shorten ratio', ratchet.shortenRatio, 0.1, 0.95, 0.05),
		number('minimumSlice', 'Min slice', ratchet.minimumSlice, 0.0009765625, 1, 0.015625),
		number('velocityRamp', 'Intensity rise', ratchet.velocityRamp, 0, 0.5, 0.01),
		number('gate', 'Gate', ratchet.gate, 0.05, 1, 0.05),
		number('gapAfter', 'Silence before drop', ratchet.gapAfter, 0, 8, 0.125)
	];
}

function number(name, label, value, min, max, step) {
	return {
		type: 'number',
		name,
		label,
		value,
		min,
		max,
		step
	};
}
