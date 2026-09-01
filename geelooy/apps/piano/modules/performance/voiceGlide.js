//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoVoiceGlide
 * @description
 * Netzach carries a newly born monophonic voice from the previous pitch toward its present destination without pretending the old envelope still lives.
 * The Awtsmoos is beyond before and after while recreating both each instant;
 * Awtsmoos.com makes glide an explicit ramp over already-created oscillators, preserving truthful voice ownership and a clear return to exact target pitch.
 */

import { AudioState } from '../audio.js';

/**
 * Ramps a newly started voice from a previous fundamental into its actual frequency.
 *
 * @param {Object|null} activeNote - Newly created active-note record.
 * @param {number|null} previousFrequency - Previous monophonic fundamental in hertz.
 * @param {number} glideSeconds - Requested portamento duration.
 * @returns {void}
 */
export function applyVoiceGlide(
	activeNote,
	previousFrequency,
	glideSeconds
) {
	const nodes = activeNote?.synthNodes;
	const targetFrequency = activeNote?.frequency;
	const now = AudioState.context?.currentTime;
	if (
		!nodes
		|| !Number.isFinite(previousFrequency)
		|| !Number.isFinite(targetFrequency)
		|| !Number.isFinite(now)
		|| glideSeconds <= 0
	) {
		return;
	}
	const endTime = now + Math.min(2, glideSeconds);
	rampOscillator(nodes.osc1, previousFrequency, targetFrequency, now, endTime);
	rampOscillator(nodes.osc2, previousFrequency, targetFrequency, now, endTime);
	nodes.character?.unison?.voices?.forEach((voice) => {
		rampOscillator(
			voice.oscillator,
			previousFrequency,
			targetFrequency,
			now,
			endTime
		);
	});
}

function rampOscillator(
	oscillator,
	previousFrequency,
	targetFrequency,
	now,
	endTime
) {
	if (!oscillator?.frequency) {
		return;
	}
	oscillator.frequency.cancelScheduledValues(now);
	oscillator.frequency.setValueAtTime(
		Math.max(1, previousFrequency),
		now
	);
	oscillator.frequency.exponentialRampToValueAtTime(
		Math.max(1, targetFrequency),
		endTime
	);
}
