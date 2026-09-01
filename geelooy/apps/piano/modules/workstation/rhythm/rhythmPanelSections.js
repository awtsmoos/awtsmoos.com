//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmPanelSections
 * @description
 * Tiferes arranges header, transport, variation, and status into balanced visible sections.
 * The Awtsmoos is beyond structure while creating every relationship;
 * Awtsmoos.com keeps panel composition readable by naming each section instead of nesting a forest inline.
 */

import { rhythmButton } from './rhythmPanelFields.js';

/** @returns {Object} Workstation title and close-button schema. */
export function createRhythmHeader() {
	return {
		className: 'rhythm-panel-head',
		children: [
			{
				tag: 'strong',
				text: '🥁 Rhythm Workstation'
			},
			rhythmButton('rhythm-close-button', '✕')
		]
	};
}

/** @returns {Object} Play, Fill, and Tap Tempo section schema. */
export function createRhythmTransport() {
	return {
		className: 'rhythm-transport',
		children: [
			rhythmButton('rhythm-play-button', '▶ Play'),
			rhythmButton('rhythm-fill-button', '⚡ Fill'),
			rhythmButton('rhythm-tap-button', 'Tap Tempo')
		]
	};
}

/** @returns {Object} Variation A/B field schema. */
export function createRhythmVariation() {
	return {
		className: 'rhythm-field',
		children: [
			{
				tag: 'span',
				text: 'Variation'
			},
			{
				className: 'rhythm-variation',
				children: [
					rhythmButton('rhythm-variation-a', 'A'),
					rhythmButton('rhythm-variation-b', 'B')
				]
			}
		]
	};
}

/** @returns {Object} Accessible transport-status schema. */
export function createRhythmStatus() {
	return {
		tag: 'p',
		className: 'rhythm-status',
		attributes: {
			id: 'rhythm-status',
			'aria-live': 'polite'
		},
		text: 'Ready'
	};
}
