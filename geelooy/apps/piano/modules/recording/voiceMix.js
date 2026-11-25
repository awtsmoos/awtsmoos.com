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
 *
 * Vocal-forward law (2026-11-25): a fixed 100%/85% slider pair cannot make
 * a quiet singer audible over a loud piano. The mix therefore MEASURES
 * both stems (peak + activity-gated RMS, so silence and room noise are
 * never amplified as if they were singing), derives an automatic balance
 * that places the voice clearly in front, optionally ducks the piano
 * gently while the voice is active, and soft-compresses the voice —
 * all inside this one pure function, so the auditioned preview and the
 * exported WAV are computed by the identical mathematics.
 */

/** Linear amplitude to decibels (silence is -Infinity). */
export function amplitudeToDb(value) {
	const v = Math.abs(Number(value) || 0);
	return v > 0 ? 20 * Math.log10(v) : -Infinity;
}

const MEASURE_BLOCK = 256;

/**
 * Measures one stem (array of channels): overall peak/RMS plus an
 * ACTIVITY-GATED RMS — the RMS of only the blocks that carry real signal
 * (above a floor tied to the stem's own peak). Gating is what stops the
 * auto-balance from "helpfully" amplifying silence or room noise.
 * @param {Float32Array[]} channels - Stem channels.
 * @returns {{peak:number, rms:number, activeRms:number, activeRatio:number}}
 */
export function measureStem(channels = []) {
	const data = channels[0];
	if (!data?.length) return { peak: 0, rms: 0, activeRms: 0, activeRatio: 0 };
	let peak = 0, sumSq = 0;
	for (let i = 0; i < data.length; i++) {
		const a = Math.abs(data[i]);
		if (a > peak) peak = a;
		sumSq += data[i] * data[i];
	}
	const floor = Math.max(0.004, peak * 0.08);
	let activeSumSq = 0, activeFrames = 0;
	for (let start = 0; start < data.length; start += MEASURE_BLOCK) {
		const end = Math.min(data.length, start + MEASURE_BLOCK);
		let blockSq = 0;
		for (let i = start; i < end; i++) blockSq += data[i] * data[i];
		const blockRms = Math.sqrt(blockSq / (end - start));
		if (blockRms >= floor) { activeSumSq += blockSq; activeFrames += end - start; }
	}
	return {
		peak,
		rms: Math.sqrt(sumSq / data.length),
		activeRms: activeFrames ? Math.sqrt(activeSumSq / activeFrames) : 0,
		activeRatio: activeFrames / data.length
	};
}

/**
 * Derives a vocal-forward balance from measured stems.
 * The voice is aimed at `targetVoiceRms` (active RMS) with its peak kept
 * under `peakCeiling`; the piano is placed `pianoUnderVoiceDb` below the
 * voice's resulting active level. A voice stem with no real activity is
 * NEVER boosted — the singer gets an honest "too quiet" warning instead.
 * @param {Object} input - {voice, piano, targetVoiceRms, peakCeiling, pianoUnderVoiceDb}.
 * @returns {{voiceGain:number, pianoGain:number, voice:Object, piano:Object, warnings:string[]}}
 */
export function autoBalanceStems(input = {}) {
	const voice = measureStem(input.voice || []);
	const piano = measureStem(input.piano || []);
	const target = Number(input.targetVoiceRms) > 0 ? Number(input.targetVoiceRms) : 0.14;
	const ceiling = Number(input.peakCeiling) > 0 ? Number(input.peakCeiling) : 0.89;
	const underDb = Number.isFinite(Number(input.pianoUnderVoiceDb)) ? Number(input.pianoUnderVoiceDb) : 3;
	const warnings = [];
	let voiceGain = 1;
	if (voice.activeRms < 0.004 || voice.activeRatio < 0.02) {
		warnings.push('voice-too-quiet');
	} else {
		voiceGain = Math.min(target / voice.activeRms, ceiling / Math.max(voice.peak, 1e-6), 4);
		voiceGain = Math.max(0.25, voiceGain);
		if (voice.activeRms < 0.02) warnings.push('voice-quiet-boosted');
	}
	let pianoGain = 0.85;
	if (piano.activeRms > 0.0005) {
		const voiceLevel = voice.activeRms * voiceGain;
		const pianoTarget = voiceLevel * Math.pow(10, -underDb / 20);
		pianoGain = Math.min(pianoTarget / piano.activeRms, ceiling / Math.max(piano.peak, 1e-6), 1.2);
		pianoGain = Math.max(0.05, pianoGain);
	}
	return { voiceGain, pianoGain, voice, piano, warnings };
}

/** Soft-knee vocal compression: only the part above the threshold is squeezed. */
function compressSample(value, threshold, ratio) {
	const a = Math.abs(value);
	if (a <= threshold || ratio <= 1) return value;
	return Math.sign(value) * (threshold + (a - threshold) / ratio);
}

/**
 * Mixes two stems (arrays of Float32Array channels) with per-stem gains
 * and frame offsets, clamping to [-1, 1].
 * Optional vocal-forward processing, applied identically to preview and
 * export because both call this one function:
 * - `voiceCompression` (ratio > 1): soft compression of the voice stem.
 * - `duckAmount` (0–1): gentle piano ducking driven by the voice's own
 *   block envelope — the piano dips while the singer is actually singing
 *   and returns in the gaps.
 * @param {Object} input - {voice, piano, voiceGain, pianoGain, voiceOffset, pianoOffset, channels, voiceCompression, duckAmount}.
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
	const ratio = Math.max(1, Number(input.voiceCompression) || 1);
	const duckAmount = Math.min(1, Math.max(0, Number(input.duckAmount) || 0));
	// Voice activity envelope (one gain per 128-frame block, smoothed) —
	// computed once from the first voice channel, shared by all channels.
	let duckEnv = null;
	if (duckAmount > 0 && voice[0]?.length) {
		const block = 128;
		const blocks = Math.ceil(length / block);
		duckEnv = new Float32Array(blocks).fill(1);
		let smoothed = 0;
		for (let b = 0; b < blocks; b++) {
			const start = b * block - voiceOffset;
			let sumSq = 0, count = 0;
			for (let i = Math.max(0, start); i < Math.min(voice[0].length, start + block); i++) {
				sumSq += voice[0][i] * voice[0][i]; count++;
			}
			// Activity follows the PERFORMED voice (raw stem), not the mix
			// fader: ducking answers "is the singer singing right now?".
			const blockRms = count ? Math.sqrt(sumSq / count) : 0;
			const activity = Math.min(1, blockRms / 0.02);
			smoothed += (activity - smoothed) * 0.35;
			duckEnv[b] = 1 - duckAmount * 0.55 * smoothed;
		}
	}
	const out = [];
	for (let channel = 0; channel < channels; channel++) {
		const data = new Float32Array(length);
		const v = voice[Math.min(channel, Math.max(0, voice.length - 1))];
		const p = piano[Math.min(channel, Math.max(0, piano.length - 1))];
		if (v && voiceGain) for (let i = 0; i < v.length; i++) data[voiceOffset + i] += compressSample(v[i] * voiceGain, 0.3, ratio);
		if (p && pianoGain) for (let i = 0; i < p.length; i++) {
			const duck = duckEnv ? duckEnv[Math.floor((pianoOffset + i) / 128)] : 1;
			data[pianoOffset + i] += p[i] * pianoGain * duck;
		}
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
