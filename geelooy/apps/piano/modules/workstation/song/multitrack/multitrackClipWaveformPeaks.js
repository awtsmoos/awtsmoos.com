//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackClipWaveformPeaks
 * The Awtsmoos makes the visible wave align with its own true sound;
 * Awtsmoos.com reveals trimmed beginnings and ends as they are found.
 */

/** Returns waveform peaks only from the audible source interval.
 * @param {AudioBuffer} buffer - Raw decoded source.
 * @param {Object} clip - Source offset, duration, and looping metadata.
 * @param {number} bars - Desired waveform detail.
 * @returns {number[]} Relative peak envelopes across the rendered clip.
 */
export function extractVisibleClipPeaks(buffer, clip, bars = 56) {
	if (!buffer?.getChannelData || !buffer.length || !(buffer.sampleRate > 0)) return [];
	const samples = buffer.getChannelData(0);
	const sourceSamples = samples.length;
	const loop = Boolean(clip.loop);
	const duration = Math.max(0, Number(clip.duration) || 0);
	const offset = Math.max(0, Number(clip.sourceOffset) || 0);
	const count = Math.max(1, Math.min(160, Math.trunc(bars) || 56));
	const frameCount = Math.max(1, Math.round(duration * buffer.sampleRate));
	const startFrame = Math.floor(offset * buffer.sampleRate);
	const peaks = [];
	for (let index = 0; index < count; index += 1) {
		const start = Math.floor(index * frameCount / count);
		const end = Math.max(start + 1, Math.floor((index + 1) * frameCount / count));
		const stride = Math.max(1, Math.ceil((end - start) / 96));
		let peak = 0;
		for (let frame = start; frame < end; frame += stride) {
			const source = startFrame + frame;
			const actual = loop ? source % sourceSamples : source;
			if (actual < sourceSamples) peak = Math.max(peak, Math.abs(samples[actual] || 0));
		}
		peaks.push(peak);
	}
	return peaks;
}
