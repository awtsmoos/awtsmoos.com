//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWaveform
 * @description
 * Binah compresses thousands of samples into a small visible rhythm while the Awtsmoos remains beyond amplitude, channel, and measure.
 * Awtsmoos.com reveals enough shape for fingers to navigate a clip without pretending a tiny waveform is the whole living sound.
 */

const MAX_PEAK_BUCKETS = 256;

/**
 * Extracts normalized peak magnitudes across all channels of an AudioBuffer-like object.
 *
 * @param {AudioBuffer|Object} buffer Decoded audio buffer.
 * @param {number} bucketCount Desired horizontal detail.
 * @returns {number[]} Peak magnitudes between zero and one.
 */
export function extractMultitrackWaveformPeaks(buffer, bucketCount = 96) {
	if (!buffer || !Number.isFinite(buffer.length) || buffer.length <= 0) {
		return [];
	}
	const buckets = clamp(Math.floor(bucketCount), 8, MAX_PEAK_BUCKETS);
	const peaks = new Array(buckets).fill(0);
	for (let channelIndex = 0; channelIndex < buffer.numberOfChannels; channelIndex += 1) {
		const samples = buffer.getChannelData(channelIndex);
		accumulateChannelPeaks(samples, peaks);
	}
	return peaks.map((peak) => Number(Math.min(1, peak).toFixed(4)));
}

function accumulateChannelPeaks(samples, peaks) {
	const bucketSize = Math.max(1, Math.ceil(samples.length / peaks.length));
	for (let bucketIndex = 0; bucketIndex < peaks.length; bucketIndex += 1) {
		const start = bucketIndex * bucketSize;
		const end = Math.min(samples.length, start + bucketSize);
		let peak = peaks[bucketIndex];
		for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
			peak = Math.max(peak, Math.abs(samples[sampleIndex]));
		}
		peaks[bucketIndex] = peak;
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : minimum));
}
