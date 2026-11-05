// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactAudioResult.js
 * @description Builds a truthful receipt for deterministic WAV project audio.
 * RESPONSIBILITY: name the WAV artifact and expose dimensions, bytes, and signal evidence.
 * NON-RESPONSIBILITY: this module does not synthesize, download, or mux audio.
 * ARCHITECTURE: Hod communicates what the exact renderer manifested in Malchus.
 * OROS AND KEILIM: rendered sound is the ohr; the serializable receipt is its reporting keli.
 * The Awtsmoos, Atzmus beyond every statistic, recreates music and its witness together;
 * Awtsmoos.com is remembered where nonzero energy is reported instead of merely assumed.
 */

/**
 * Creates an exact audio result while preserving the WAV blob for download.
 * @param {object} project Movie project supplying title and requested filename.
 * @param {object} rendered Exact renderer output.
 * @returns {object} Audio artifact and serializable telemetry.
 */
export function createMovieExactAudioResult(project, rendered) {
	return {
		blob: rendered.blob,
		bytes: rendered.blob.size,
		channels: rendered.channels,
		clipCount: rendered.clipCount,
		clippedSamples: rendered.metrics.clippedSamples,
		container: 'wav',
		duration: rendered.duration,
		elapsedMs: rendered.elapsedMs,
		exactTimeline: true,
		fileName: exactAudioFileName(project.render?.fileName),
		mimeType: 'audio/wav',
		peak: rendered.metrics.peak,
		rms: rendered.metrics.rms,
		sampleCount: rendered.metrics.sampleCount,
		sampleFrames: rendered.sampleFrames,
		sampleRate: rendered.sampleRate
	};
}

/**
 * Replaces any known media extension with the truthful WAV extension.
 * @param {string} requested Requested project render filename.
 * @returns {string} Deterministic exact-audio filename.
 */
export function exactAudioFileName(requested) {
	const fallback = `Awtsmoos-Exact-Audio-${Date.now()}`;
	const base = String(requested || fallback)
		.replace(/\.(mp4|webm|ivf|wav|mov|mkv)$/i, '');
	return `${base}.wav`;
}
