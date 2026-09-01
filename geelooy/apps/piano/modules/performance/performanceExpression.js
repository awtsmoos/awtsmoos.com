//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoPerformanceExpression
 * @description
 * Tiferes lets bend, wheel, and pressure color living voices without rewriting the preset from which those voices were born.
 * The Awtsmoos is beyond temporary and permanent while recreating both each instant;
 * Awtsmoos.com keeps expression as an overlay, so releasing a controller returns the instrument to its remembered timbre instead of silently saving a new patch.
 */

import { AudioState } from '../audio.js';
import {
	activeNotes,
	currentChordNodes
} from './synthState.js';
import {
	performanceState,
	setPerformanceParameter
} from './performanceState.js';

/** @param {number} normalized - Pitch bend from -1 to 1. @returns {void} */
export function setPitchBend(normalized) {
	setPerformanceParameter('pitchBendNormalized', normalized);
	refreshPerformanceExpression();
}

/** @param {number} normalized - Modulation wheel from 0 to 1. @returns {void} */
export function setModulation(normalized) {
	setPerformanceParameter('modulation', normalized);
	refreshPerformanceExpression();
}

/** @param {number} normalized - Channel pressure from 0 to 1. @returns {void} */
export function setChannelPressure(normalized) {
	setPerformanceParameter('pressure', normalized);
	refreshPerformanceExpression();
}

/** Applies current expressive controllers to every direct and generated chord voice. @returns {void} */
export function refreshPerformanceExpression() {
	activeNotes.forEach((activeNote) => {
		applyExpressionToVoice(activeNote?.synthNodes);
	});
	currentChordNodes.forEach((nodes) => {
		applyExpressionToVoice(nodes);
	});
}

/** @param {Object|null} nodes - One live synthesis voice. @returns {void} */
export function applyExpressionToVoice(nodes) {
	const now = AudioState.context?.currentTime;
	if (!nodes || nodes.stopped || !Number.isFinite(now)) {
		return;
	}
	applyBend(nodes, now);
	applyWheel(nodes, now);
	applyPressure(nodes, now);
}

function applyBend(nodes, now) {
	const cents = performanceState.pitchBendNormalized
		* performanceState.pitchBendRange
		* 100;
	const detune = nodes.preset?.detuneCents || 0;
	const drift = nodes.human?.drift || 0;
	nodes.osc1?.detune.setTargetAtTime(
		drift - detune * 0.5 + cents,
		now,
		0.008
	);
	nodes.osc2?.detune.setTargetAtTime(
		drift + detune * 0.5 + cents,
		now,
		0.008
	);
	nodes.character?.unison?.voices?.forEach((voice) => {
		voice.oscillator?.detune.setTargetAtTime(
			(voice.baseDetune || 0) + cents,
			now,
			0.008
		);
	});
}

function applyWheel(nodes, now) {
	const wheel = performanceState.modulation;
	const baseFilterLfo = nodes.preset?.lfoToFilter || 0;
	nodes.lfoGain?.gain.setTargetAtTime(
		Math.min(1600, baseFilterLfo + wheel * 520),
		now,
		0.018
	);
	const vibratoDepth = nodes.character?.vibrato?.depth?.gain;
	if (vibratoDepth) {
		vibratoDepth.setTargetAtTime(
			Math.min(
				36,
				(nodes.preset?.vibratoCents || 0) + wheel * 12
			),
			now,
			0.018
		);
	}
}

function applyPressure(nodes, now) {
	const base = (nodes.preset?.filterCutoff || 2600)
		* (nodes.human?.brightness || 1);
	const target = Math.min(
		9000,
		base * (1 + performanceState.pressure * 0.65)
	);
	nodes.filter?.frequency.setTargetAtTime(target, now, 0.025);
}
