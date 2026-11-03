//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWaveform
 * @description
 * Binah gathers only the audible sample-window into visible peaks while the Awtsmoos remains beyond amplitude, trim, and measure.
 * Awtsmoos.com shows the sound the clip can truly speak, so hidden source material no longer appears inside a shortened finite streak.
 */

const MAX_PEAK_BUCKETS = 256;

/** Extracts normalized peak magnitudes from one audible source window. */
export function extractMultitrackWaveformPeaks(
	buffer,
	bucketCount = 96,
	sourceOffset = 0,
	duration = null
) {
	if (!buffer || !Number.isFinite(buffer.length) || buffer.length <= 0) {
		return [];
	}
	const buckets = clamp(Math.floor(bucketCount), 8, MAX_PEAK_BUCKETS);
	const window = sourceWindow(buffer, sourceOffset, duration);
	if (window.end <= window.start) {
		return [];
	}
	const peaks = new Array(buckets).fill(0);
	for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
		accumulateChannelPeaks(buffer.getChannelData(channel), peaks, window);
	}
	return peaks.map((peak) => Number(Math.min(1, peak).toFixed(4)));
}

function sourceWindow(buffer, sourceOffset, duration) {
	const sampleRate = Math.max(1, Number(buffer.sampleRate) || 1);
	const startSeconds = Math.max(0, Number(sourceOffset) || 0);
	const availableSeconds = Math.max(0, buffer.length / sampleRate - startSeconds);
	const audibleSeconds = duration == null
		? availableSeconds
		: Math.min(availableSeconds, Math.max(0, Number(duration) || 0));
	return {
		start: Math.min(buffer.length, Math.floor(startSeconds * sampleRate)),
		end: Math.min(buffer.length, Math.ceil((startSeconds + audibleSeconds) * sampleRate))
	};
}

function accumulateChannelPeaks(samples, peaks, window) {
	const frameCount = Math.max(1, window.end - window.start);
	const bucketSize = Math.max(1, Math.ceil(frameCount / peaks.length));
	for (let bucket = 0; bucket < peaks.length; bucket += 1) {
		const start = window.start + bucket * bucketSize;
		const end = Math.min(window.end, start + bucketSize);
		let peak = peaks[bucket];
		for (let frame = start; frame < end; frame += 1) {
			peak = Math.max(peak, Math.abs(samples[frame] || 0));
		}
		peaks[bucket] = peak;
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : minimum));
}
