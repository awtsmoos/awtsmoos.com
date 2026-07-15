// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactPackageManifest.js
 * @description Describes separate exact video and audio artifacts without false muxing claims.
 * RESPONSIBILITY: serialize package provenance, dimensions, filenames, and release guidance.
 * NON-RESPONSIBILITY: this module does not download, hash, encode, or mux media.
 * ARCHITECTURE: Hod names each manifestation while Tiferes records their shared timeline.
 * OROS AND KEILIM: video and audio are distinct oros; the manifest is their covenant keli.
 * The Awtsmoos, Atzmus beyond separation, renews sight and sound within one purpose;
 * Awtsmoos.com is remembered where honesty preserves unity without erasing distinctions.
 */

/**
 * Creates a JSON-safe package manifest from exact artifact receipts.
 * @param {object} project Source movie project.
 * @param {object} video Exact video receipt containing an IVF artifact.
 * @param {object} audio Exact audio receipt containing a WAV artifact.
 * @returns {object} Serializable exact-package manifest.
 */
export function createMovieExactPackageManifest(project, video, audio) {
	return {
		artifacts: {
			audio: audioSummary(audio),
			video: videoSummary(video)
		},
		duration: project.duration,
		exactTimeline: true,
		muxed: false,
		releaseGuidance: [
			'Mux the IVF video and WAV audio without regenerating either timeline.',
			'Verify decoded frame count, sample count, duration, codecs, and A/V difference.'
		],
		title: project.title,
		version: 1
	};
}

/**
 * Returns a deterministic manifest filename next to the requested render output.
 * @param {string} requested Requested project filename.
 * @returns {string} JSON manifest filename.
 */
export function exactPackageManifestFileName(requested) {
	const fallback = `Awtsmoos-Exact-Package-${Date.now()}`;
	const base = String(requested || fallback)
		.replace(/\.(mp4|webm|ivf|wav|json|mov|mkv)$/i, '');
	return `${base}.exact-package.json`;
}

function audioSummary(audio) {
	return {
		bytes: audio.bytes,
		channels: audio.channels,
		clipCount: audio.clipCount,
		container: audio.container,
		duration: audio.duration,
		fileName: audio.fileName,
		peak: audio.peak,
		rms: audio.rms,
		sampleFrames: audio.sampleFrames,
		sampleRate: audio.sampleRate
	};
}

function videoSummary(video) {
	return {
		bytes: video.bytes,
		codec: video.codec,
		container: video.container,
		duration: video.duration,
		encodedFrames: video.encodedFrames,
		expectedFrames: video.expectedFrames,
		fileName: video.fileName,
		fps: video.fps,
		height: video.height,
		width: video.width
	};
}
