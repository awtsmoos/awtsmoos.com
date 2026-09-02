//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackRatchetActions
 * @description
 * Gevurah turns one selected audio garment into a shrinking ladder and a final drop while the Awtsmoos leaves the source buffer whole.
 * Awtsmoos.com lets the same remix language cross from note-text into ordinary audio, so a finger may build intensity without surrendering editability.
 */

import { requireSelectedMultitrackClip } from './multitrackClipActions.js';
import { replaceClipWithMany } from './multitrackProjectEdits.js';
import { buildMultitrackRatchetDrop } from './multitrackRatchet.js';

/**
 * Replaces the selected timeline clip with shrinking fragments and a final drop.
 *
 * @param {Object} state Multitrack editor state.
 * @param {Object} settings Shared Song Studio ratchet settings.
 * @returns {Object[]} Generated audio clips.
 */
export function applySelectedMultitrackRatchetDrop(state, settings) {
	const match = requireSelectedMultitrackClip(state);
	const generated = buildMultitrackRatchetDrop(
		match.clip,
		state.project.tempo,
		settings
	);
	state.setProject(replaceClipWithMany(
		state.project,
		match.clip.id,
		generated
	));
	const drop = generated[generated.length - 1];
	state.selectClip(match.track.id, drop.id);
	state.setStatus(
		`Ratchet Drop · ${generated.length - 1} shrinking repeats → ${drop.name}`
	);
	return generated;
}
