//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleVoice
 * @description
 * The Awtsmoos joins a real recorded attack to procedural tone without making the network master the key;
 * Awtsmoos.com keeps synthesis immediate and admits each sample only inside the articulation's own truthful attack window.
 */

import { loadSampleCatalog } from './sampleCatalog.js';
import { loadSampleBuffer } from './sampleLoader.js';
import { selectSample } from './sampleSelector.js';
import { createSampleVoice } from './sampleVoiceFactory.js';

const DEFAULT_MAX_LATE_START = 0.12;

/**
 * @description Asynchronously attaches the nearest decoded sample to an already sounding procedural voice without delaying note-on.
 * @param {AudioContext} context - Active Web Audio context.
 * @param {Object} nodes - Parent synth voice graph and lifecycle record.
 * @param {string} noteName - Played scientific pitch name.
 * @param {Object} preset - Current hybrid/acoustic preset containing sample selection and timing policy.
 * @param {number} startedAt - Parent note AudioContext start time.
 * @returns {Promise<Object|null>} Attached sample voice, or null when sampling is disabled, unavailable, late, or the parent already stopped.
 */
export async function attachSampleVoice(
	context,
	nodes,
	noteName,
	preset,
	startedAt
) {
	if (!samplingIsEnabled(preset)) {
		return null;
	}

	try {
		const selection = await selectRemoteSample(preset, noteName);

		if (!selection) {
			nodes.sampleStatus = 'no-anchor';
			return null;
		}

		const buffer = await loadSampleBuffer(context, selection.sample);

		if (!sampleMayStillStart(context, nodes, preset, startedAt)) {
			nodes.sampleStatus = 'late-or-stopped';
			return null;
		}

		const sampleVoice = createSampleVoice(
			context,
			nodes.filter,
			buffer,
			selection,
			preset.sampleMix,
			context.currentTime
		);

		nodes.sampleVoice = sampleVoice;
		nodes.sampleStatus = 'playing';
		return sampleVoice;
	} catch (error) {
		nodes.sampleStatus = error?.code || error?.name || 'sample-error';
		return null;
	}
}

/**
 * @description Determines whether a preset requests a remote sample layer with audible contribution.
 * @param {Object} preset - Current synthesis preset.
 * @returns {boolean} True when an instrument is configured and sampleMix is positive.
 */
function samplingIsEnabled(preset) {
	return Boolean(preset?.sampleInstrument)
		&& (preset.sampleMix || 0) > 0;
}

/**
 * @description Loads catalog metadata and applies articulation/transposition policy for one requested note.
 * @param {Object} preset - Acoustic preset containing instrument, articulation, and max-transpose policy.
 * @param {string} noteName - Requested scientific pitch.
 * @returns {Promise<Object|null>} Nearest valid sample selection or null when no acceptable anchor exists.
 */
async function selectRemoteSample(preset, noteName) {
	const catalog = await loadSampleCatalog();
	const samples = catalog.get(preset.sampleInstrument) || [];

	return selectSample(
		samples,
		noteName,
		preset.sampleArticulation,
		preset.sampleMaxTranspose
	);
}

/**
 * @description Prevents remote audio from entering after its attack would sound detached from the articulation or after parent release/disposal.
 * @param {AudioContext} context - Active Web Audio context.
 * @param {Object} nodes - Parent voice lifecycle state.
 * @param {Object} preset - Preset containing sampleMaxLateStart timing policy.
 * @param {number} startedAt - Original note start time.
 * @returns {boolean} True only while the parent is alive and the sample attack remains timely.
 */
function sampleMayStillStart(context, nodes, preset, startedAt) {
	if (nodes.stopped || nodes.disposed) {
		return false;
	}

	const configuredWindow = Number(preset.sampleMaxLateStart);
	const maxLateStart = Number.isFinite(configuredWindow)
		? Math.max(0, configuredWindow)
		: DEFAULT_MAX_LATE_START;

	return context.currentTime - startedAt <= maxLateStart;
}
