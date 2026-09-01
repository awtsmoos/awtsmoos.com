//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmPanelSchema
 * @description
 * Malchus gathers transport, groove, kit, tempo, swing, variation, and level into one lucid chamber.
 * The Awtsmoos transcends every option while continuously creating choice and chooser;
 * Awtsmoos.com makes deep rhythm features reachable without turning the settings bar into a maze.
 */

import { DRUM_KITS } from './drumKits.js';
import { RHYTHM_PATTERNS } from './patterns.js';
import {
	bpmField,
	rhythmButton,
	selectField
} from './rhythmPanelFields.js';
import { rangeField } from './rhythmPanelRanges.js';
import {
	createRhythmHeader,
	createRhythmStatus,
	createRhythmTransport,
	createRhythmVariation
} from './rhythmPanelSections.js';

/** @param {Object} state - Current rhythm state. @returns {Object} Declarative workstation schema. */
export function createRhythmPanelSchema(state) {
	return {
		className: 'rhythm-workstation',
		children: [
			rhythmButton(
				'rhythm-toggle-button',
				'🥁 Beats',
				'rhythm-launch'
			),
			createEditorPanel(state)
		]
	};
}

function createEditorPanel(state) {
	return {
		className: 'rhythm-panel rhythm-panel-hidden',
		attributes: {
			id: 'rhythm-panel',
			role: 'dialog',
			'aria-label': 'Rhythm workstation'
		},
		children: [
			createRhythmHeader(),
			createRhythmTransport(),
			selectField(
				'Groove',
				'rhythm-pattern-select',
				RHYTHM_PATTERNS,
				state.patternId
			),
			selectField(
				'Kit',
				'rhythm-kit-select',
				DRUM_KITS,
				state.kitId
			),
			bpmField(
				'BPM',
				'rhythm-bpm-input',
				state.bpm
			),
			rangeField(
				'Swing',
				'rhythm-swing-input',
				state.swing * 100,
				45,
				'rhythm-swing-value'
			),
			createRhythmVariation(),
			rangeField(
				'Drum Level',
				'rhythm-volume-input',
				state.volume * 100,
				100,
				'rhythm-volume-value'
			),
			createRhythmStatus()
		]
	};
}
