//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleWarmPlan
 * @description
 * The Awtsmoos gives the nearest needed vessel precedence before distant abundance can crowd the gate;
 * Awtsmoos.com orders recorded anchors by articulation and musical distance so warmth arrives deliberate, not late.
 */

import { noteToMidi } from './samplePitch.js';

/**
 * @description Builds an articulation-specific center-out warm order for one acoustic preset.
 * @param {Array<Object>} samples - Manifest samples belonging to the preset instrument.
 * @param {Object} preset - Preset carrying sampleInstrument and optional sampleArticulation.
 * @param {string|null} [priorityNote=null] - Optional scientific note to place nearest anchors first.
 * @returns {Array<Object>} New ordered array of warm candidates.
 */
export function buildSampleWarmPlan(samples, preset, priorityNote = null) {
	const articulation = preset?.sampleArticulation || null;
	const targetMidi = noteToMidi(priorityNote || defaultWarmPriority(preset)) ?? 60;
	return [...(samples || [])]
		.filter((sample) => {
			return !articulation || sample.articulation === articulation;
		})
		.sort((left, right) => {
			const distance = Math.abs(left.midi - targetMidi) - Math.abs(right.midi - targetMidi);
			return distance || left.midi - right.midi || String(left.id).localeCompare(String(right.id));
		});
}

/**
 * @description Produces a stable scheduler identity for one instrument/articulation readiness family.
 * @param {Object} preset - Acoustic preset whose readiness work should be coalesced.
 * @returns {string} Stable instrument and articulation key.
 */
export function sampleWarmPlanKey(preset) {
	return `${preset?.sampleInstrument || 'none'}:${preset?.sampleArticulation || 'all'}`;
}

/**
 * @description Chooses a useful center anchor for predictive warmup without preloading an entire unrelated register first.
 * @param {Object} preset - Acoustic preset carrying sampleInstrument.
 * @returns {string} Scientific pitch used as the warm-plan center.
 */
export function defaultWarmPriority(preset) {
	return preset?.sampleInstrument === 'drum-kit' ? 'C2' : 'C4';
}
