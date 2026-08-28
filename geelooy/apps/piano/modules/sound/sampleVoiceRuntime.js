//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleVoiceRuntime
 * @description
 * The Awtsmoos lets the played recording cross first while tomorrow's anchors wait beyond the gate;
 * Awtsmoos.com separates note-critical attachment from deferred bank warmth so realism arrives sooner, not merely great.
 */

import { attachSampleVoice } from './sampleVoice.js';
import { scheduleSamplePresetWarmup } from './sampleWarmScheduler.js';

const POST_ATTACK_WARM_DELAY_MS = 140;

/**
 * @description Starts the selected remote sample without awaiting it and defers sibling warming until that critical request settles.
 * @param {AudioContext} context - Active Web Audio context.
 * @param {Object} nodes - Active parent voice record receiving sample lifecycle state.
 * @param {string} noteName - Played scientific pitch used for sample selection.
 * @param {number} startedAt - Parent note start time used by the late-attack honesty gate.
 * @returns {void}
 */
export function startRemoteSampleLayer(context, nodes, noteName, startedAt) {
	const preset = nodes?.preset;

	if (!preset?.sampleInstrument || (preset.sampleMix || 0) <= 0) {
		return;
	}

	nodes.sampleStatus = 'loading';
	nodes.samplePromise = attachSampleVoice(
		context,
		nodes,
		noteName,
		preset,
		startedAt
	);
	nodes.samplePromise.then(
		() => {
			scheduleSiblingWarmup(context, preset);
		},
		() => {
			scheduleSiblingWarmup(context, preset);
		}
	);
}

/**
 * @description Begins bounded future-note warmth only after the note-critical attachment attempt has completed.
 * @param {AudioContext} context - Active Web Audio context receiving future decoded anchors.
 * @param {Object} preset - Acoustic preset whose selected articulation should warm.
 * @returns {void}
 */
function scheduleSiblingWarmup(context, preset) {
	void scheduleSamplePresetWarmup(context, preset, {
		delayMs: POST_ATTACK_WARM_DELAY_MS,
		maxConcurrent: 2
	});
}
