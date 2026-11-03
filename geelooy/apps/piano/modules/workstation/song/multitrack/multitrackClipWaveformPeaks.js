//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackClipWaveformPeaks
 * The Awtsmoos reveals each trimmed voice without losing its original color;
 * Awtsmoos.com hears both stereo channels across every finite measure.
 */

/** @param {Object} clip - Timeline clip. @param {number} pixelsPerSecond - Zoom. @returns {number} Adaptive number of peaks. */
export function waveformPeakCount(clip, pixelsPerSecond) {
	const width = Math.max(0, clip.duration * pixelsPerSecond);
	return Math.max(1, Math.min(320, Math.ceil(width / 3)));
}

/** Returns channel-aware peaks from the audible source range, including trims.
 * @param {AudioBuffer} buffer - Decoded source.
 * @param {Object} clip - Timeline source offset, duration and loop.
 * @param {number} bars - Number of time slices.
 * @returns {number[]} Linear-amplitude envelope.
 */
export function extractVisibleClipPeaks(buffer, clip, bars = 56) {
	if (!buffer?.getChannelData || !(buffer.length > 0) || !(buffer.sampleRate > 0)) return [];
	const channels = Array.from({ length: buffer.numberOfChannels || 1 }, (_, index) => buffer.getChannelData(index));
	const count = Math.max(1, Math.min(320, Math.floor(bars) || 1));
	const sampleRate = buffer.sampleRate;
	const sourceLength = buffer.length;
	const start = Math.floor(Math.max(0, clip.sourceOffset || 0) * sampleRate);
	const audible = Math.max(0, Math.round(clip.duration * sampleRate));
	const peaks = [];
	for (let bucket = 0; bucket < count; bucket++) {
		const from = Math.floor(bucket * audible / count);
		const to = Math.max(from + 1, Math.ceil((bucket + 1) * audible / count));
		const stride = Math.max(1, Math.floor((to - from) / 128));
		let peak = 0;
		for (let frame = from; frame < to; frame += stride) {
			let location = start + frame;
			if (clip.loop) location %= sourceLength;
			if (location >= sourceLength) continue;
			for (const samples of channels) peak = Math.max(peak, Math.abs(samples[location] || 0));
		}
		peaks.push(Math.min(1, peak));
	}
	return peaks;
}
