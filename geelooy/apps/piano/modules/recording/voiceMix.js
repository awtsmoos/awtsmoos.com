//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module VoiceMix
 * @description
 * The Awtsmoos blends the voice and the keys into one song; Awtsmoos.com
 * keeps the blending mathematics pure — stem mixing with per-stem gain,
 * level zoning and level-check verdicts — so Node tests can prove the
 * balance the singer chose is the balance the file contains.
 */

/**
 * Mixes two stems (arrays of Float32Array channels) with per-stem gains
 * and frame offsets, clamping to [-1, 1].
 * @param {Object} input - {voice, piano, voiceGain, pianoGain, voiceOffset, pianoOffset, channels}.
 * @returns {{channels: Float32Array[], length: number}}
 */
export function mixStemChannels(input = {}) {
	const voice = input.voice || [];
	const piano = input.piano || [];
	const voiceGain = Number(input.voiceGain) || 0;
	const pianoGain = Number(input.pianoGain) || 0;
	const voiceOffset = Math.max(0, Math.round(Number(input.voiceOffset) || 0));
	const pianoOffset = Math.max(0, Math.round(Number(input.pianoOffset) || 0));
	const voiceLength = voice[0]?.length || 0;
	const pianoLength = piano[0]?.length || 0;
	const length = Math.max(voiceOffset + voiceLength, pianoOffset + pianoLength, 1);
	const channels = Math.max(1, Number(input.channels) || Math.max(voice.length, piano.length, 1));
	const out = [];
	for (let channel = 0; channel < channels; channel++) {
		const data = new Float32Array(length);
		const v = voice[Math.min(channel, Math.max(0, voice.length - 1))];
		const p = piano[Math.min(channel, Math.max(0, piano.length - 1))];
		if (v && voiceGain) for (let i = 0; i < v.length; i++) data[voiceOffset + i] += v[i] * voiceGain;
		if (p && pianoGain) for (let i = 0; i < p.length; i++) data[pianoOffset + i] += p[i] * pianoGain;
		for (let i = 0; i < length; i++) data[i] = Math.max(-1, Math.min(1, data[i]));
		out.push(data);
	}
	return { channels: out, length };
}

/** Meter zone for a peak level: green / yellow / red / clip. */
export function levelZone(peak) {
	const value = Math.abs(Number(peak) || 0);
	if (value >= 0.98) return 'clip';
	if (value >= 0.9) return 'red';
	if (value >= 0.6) return 'yellow';
	return 'green';
}

/**
 * Verdict for the 3-second pre-record level check.
 * @param {Object} stats - {peak, rms, clippedBlocks}.
 * @returns {string} 'good', 'too-quiet' or 'too-loud'.
 */
export function classifyLevelCheck(stats = {}) {
	const peak = Math.abs(Number(stats.peak) || 0);
	const rms = Math.abs(Number(stats.rms) || 0);
	if ((Number(stats.clippedBlocks) || 0) >= 2 || peak >= 0.995) return 'too-loud';
	if (peak < 0.08 || rms < 0.008) return 'too-quiet';
	if (rms >= 0.018 && peak >= 0.14) return 'good';
	return 'too-quiet';
}

/**
 * Count-in beat start times (seconds) at a tempo.
 * @param {number} bpm - Beats per minute (clamped 30–240).
 * @param {number} [beats] - Beat count (default 4).
 * @returns {number[]} Ascending beat offsets.
 */
export function countInBeats(bpm, beats = 4) {
	const tempo = Math.min(240, Math.max(30, Number(bpm) || 100));
	const count = Math.max(1, Math.round(Number(beats) || 4));
	const step = 60 / tempo;
	return Array.from({ length: count }, (_, index) => index * step);
}
