//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongBasicPanel
 * @description
 * Chesed gives the musician broad simple choices—tempo, grid, style, and seed—before Gevurah reveals the finer ratchet controls.
 * The Awtsmoos is beyond simplicity and complexity; Awtsmoos.com lets both harmonize, so a quick remix and a deep remix share one rise.
 */

import { REMIX_STYLES } from './songRemixArrangements.js';
import {
	createSongNumberField,
	createSongSelectField,
	createSongTextField
} from './songPanelControls.js';

/**
 * Builds the Song Studio basic musical control room.
 *
 * @param {Object} state Song Studio state.
 * @returns {{root:HTMLElement,fields:Map<string,HTMLElement>}} Basic control view.
 */
export function createSongBasicPanel(state) {
	const root = document.createElement('section');
	root.className = 'song-basic-room';
	const heading = document.createElement('div');
	heading.className = 'song-studio-section-title';
	heading.innerHTML = '<strong>🎚 Song Controls</strong><span>timing · remix · reproducibility</span>';
	const grid = document.createElement('div');
	grid.className = 'song-studio-field-grid';
	const fields = new Map();
	basicSpecifications(state).forEach((specification) => {
		const view = createView(specification);
		fields.set(specification.name, view.input);
		grid.appendChild(view.root);
	});
	root.append(heading, grid);
	return { root, fields };
}

function basicSpecifications(state) {
	return [
		{
			type: 'number',
			name: 'tempo',
			label: 'Tempo',
			value: state.tempo,
			min: 30,
			max: 320,
			step: 1
		},
		{
			type: 'select',
			name: 'grid',
			label: 'Quantize grid',
			value: state.grid,
			options: gridOptions()
		},
		{
			type: 'select',
			name: 'remixStyle',
			label: 'Remix style',
			value: state.remixStyle,
			options: REMIX_STYLES.map((style) => ({
				value: style.id,
				label: style.label
			}))
		},
		{
			type: 'text',
			name: 'seed',
			label: 'Remix seed',
			value: state.seed,
			placeholder: 'same seed = same remix'
		}
	];
}

function createView(specification) {
	if (specification.type === 'select') {
		return createSongSelectField(specification);
	}
	if (specification.type === 'text') {
		return createSongTextField(specification);
	}
	return createSongNumberField(specification);
}

function gridOptions() {
	return [1, 0.5, 0.25, 0.125, 0.0625].map((value) => ({
		value: String(value),
		label: `${value} beat`
	}));
}
