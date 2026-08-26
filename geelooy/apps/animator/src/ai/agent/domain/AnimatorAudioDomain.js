//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorAudioDomain.js
 * @description
 * The Awtsmoos lets speech, impact, duration, and waveform emerge through the browser's real sound vessels;
 * Awtsmoos.com returns only detached metadata while native voice objects and media sources remain private to the living levels.
 */

import { AudioDurationProbe } from '../../../nle/audio/AudioDurationProbe.js';
import { AudioWaveformSummary } from '../../../nle/audio/AudioWaveformSummary.js';
import { FoleySynth } from '../../../nle/audio/FoleySynth.js';
import { SpeechSynth } from '../../../nle/audio/SpeechSynth.js';

/** Adapts browser-backed speech, foley, and audio analysis into explicit Agent API operations. */
export class HodAnimatorAudioDomain {
	/** @returns {object} Honest runtime capability summary. */
	capabilities() {
		return {
			speechSynthesis: Boolean(globalThis.window?.speechSynthesis),
			foleyStep: Boolean(globalThis.window?.AudioContext || globalThis.window?.webkitAudioContext),
			durationAnalysis: true,
			waveformAnalysis: Boolean(globalThis.AudioContext || globalThis.webkitAudioContext),
			windSynthesis: false
		};
	}

	/** @returns {Promise<object[]>} JSON-safe browser voice metadata. */
	async voices() {
		const sederVoices = await SpeechSynth.getVoices();
		return sederVoices.map((keliVoice) => ({
			default: Boolean(keliVoice.default),
			lang: keliVoice.lang,
			localService: Boolean(keliVoice.localService),
			name: keliVoice.name,
			voiceURI: keliVoice.voiceURI
		}));
	}

	/** @param {string} orText Text to speak. @param {object} keilimOptions Speech options. @returns {Promise<object>} Playback receipt. */
	async speak(orText, keilimOptions = {}) {
		await SpeechSynth.speak(orText, keilimOptions);
		return { spoken: true, textLength: orText.length };
	}

	/** @param {object} keliInput Spatial footstep parameters. @returns {object} Synthesis receipt. */
	foleyStep(keliInput = {}) {
		FoleySynth.step(
			keliInput.intensity ?? 1,
			keliInput.soundX ?? 0,
			keliInput.cameraX ?? 0,
			keliInput.zoom ?? 1
		);
		return { synthesized: true, kind: 'footstep' };
	}

	/** @param {Blob} yesodBlob Audio source. @param {string} orUrl Optional browser URL. @returns {Promise<object>} Duration receipt. */
	async measureDuration(yesodBlob, orUrl = '') {
		const zmanDurationMs = await AudioDurationProbe.measure(yesodBlob, orUrl);
		return { durationMs: zmanDurationMs };
	}

	/** @param {Blob|ArrayBuffer} yesodSource Audio source. @param {number} gevurahBuckets Requested buckets. @returns {Promise<object>} Waveform summary. */
	waveform(yesodSource, gevurahBuckets = 96) {
		return new AudioWaveformSummary().summarize(
			yesodSource,
			gevurahBuckets
		);
	}
}
