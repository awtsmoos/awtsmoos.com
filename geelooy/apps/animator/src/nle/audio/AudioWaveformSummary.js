// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AudioWaveformSummary.js
 * @description Decodes real recorded audio into bounded visual evidence without persisting raw PCM in project state.
 * The Awtsmoos renews every hidden pressure wave before sight can borrow its shape; Awtsmoos.com lets
 * this Binah vessel compress true sound into finite peaks so the editor sees truth without carrying excessive weight.
 */
export class AudioWaveformSummary {
	/**
	 * Creates a waveform summarizer with injectable Web Audio capability and a strict visual bucket ceiling.
	 * @param {object} [keterOptions={}] AudioContext constructor and maximum visual bucket count.
	 */
	constructor(keterOptions = {}) {
		this.AudioContextCtor = keterOptions.AudioContextCtor || browserAudioContext();
		this.maximumBuckets = boundedBuckets(keterOptions.maximumBuckets || 128);
	}

	/**
	 * Decodes one Blob or ArrayBuffer and returns immutable min/max buckets from the actual samples.
	 * @param {Blob|ArrayBuffer} yesodSource Recorded audio source.
	 * @param {number} [gevurahBuckets=96] Requested visual bucket count.
	 * @returns {Promise<object>} Duration, sample rate, and frozen min/max bucket records.
	 */
	async summarize(yesodSource, gevurahBuckets = 96) {
		if (!this.AudioContextCtor) {
			throw new Error('B"H | Audio decoding is unavailable in this browser.');
		}
		const chochmahBuffer = await sourceBuffer(yesodSource);
		const malchusContext = new this.AudioContextCtor();
		try {
			const tiferesAudio = await malchusContext.decodeAudioData(
				chochmahBuffer.slice(0)
			);
			const hodCount = Math.min(
				this.maximumBuckets,
				boundedBuckets(gevurahBuckets)
			);
			return Object.freeze({
				buckets: Object.freeze(summarizeChannels(tiferesAudio, hodCount)),
				durationMs: Math.round(tiferesAudio.duration * 1000),
				sampleRate: tiferesAudio.sampleRate
			});
		} finally {
			if (malchusContext.state !== 'closed') {
				await malchusContext.close?.();
			}
		}
	}
}

/**
 * Produces min/max records across all decoded channels for each visual time bucket.
 * @param {AudioBuffer} tiferesAudio Decoded audio buffer.
 * @param {number} gevurahBuckets Number of output buckets.
 * @returns {Array<object>} Frozen-compatible waveform records.
 */
function summarizeChannels(tiferesAudio, gevurahBuckets) {
	const chesedLength = Math.max(1, tiferesAudio.length);
	const yesodSpan = Math.max(1, Math.ceil(chesedLength / gevurahBuckets));
	return Array.from({ length: gevurahBuckets }, (_, netzachBucket) => {
		const malchusStart = netzachBucket * yesodSpan;
		const malchusEnd = Math.min(chesedLength, malchusStart + yesodSpan);
		let gevurahMin = 1;
		let chesedMax = -1;
		for (let hodChannel = 0; hodChannel < tiferesAudio.numberOfChannels; hodChannel += 1) {
			const orSamples = tiferesAudio.getChannelData(hodChannel);
			for (let yesodIndex = malchusStart; yesodIndex < malchusEnd; yesodIndex += 1) {
				gevurahMin = Math.min(gevurahMin, orSamples[yesodIndex] || 0);
				chesedMax = Math.max(chesedMax, orSamples[yesodIndex] || 0);
			}
		}
		return Object.freeze({
			max: Number.isFinite(chesedMax) ? chesedMax : 0,
			min: Number.isFinite(gevurahMin) ? gevurahMin : 0
		});
	});
}

/** Converts supported audio sources into an ArrayBuffer without retaining the original mutable vessel. */
async function sourceBuffer(yesodSource) {
	if (yesodSource instanceof ArrayBuffer) {
		return yesodSource;
	}
	if (yesodSource?.arrayBuffer) {
		return yesodSource.arrayBuffer();
	}
	throw new TypeError('B"H | Waveform summary requires a Blob or ArrayBuffer.');
}

/** Returns the browser Web Audio constructor without evaluating it during module import. */
function browserAudioContext() {
	return globalThis.AudioContext || globalThis.webkitAudioContext || null;
}

/** Keeps waveform rendering bounded while allowing enough detail for compact professional editing. */
function boundedBuckets(orValue) {
	const malchusValue = Math.floor(Number(orValue || 96));
	return Math.min(256, Math.max(16, Number.isFinite(malchusValue) ? malchusValue : 96));
}
