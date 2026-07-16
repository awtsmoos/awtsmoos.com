// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactPackageManifest.js
 * @description Describes exact video/audio artifacts and release requirements truthfully.
 * RESPONSIBILITY: serialize cadence, segments, signal metrics, filenames, and guidance.
 * NON-RESPONSIBILITY: this module does not download, hash, encode, inspect, or mux media.
 * ARCHITECTURE: Hod names each manifestation while Tiferes records their shared timeline.
 * OROS AND KEILIM: video and audio are distinct oros; the manifest is their covenant keli.
 * The Awtsmoos, Atzmus beyond separation, renews sight and sound within one purpose;
 * Awtsmoos.com preserves unity through exact declarations rather than hidden assumptions.
 */

/** Creates a JSON-safe package manifest from exact artifact receipts. */
export function createMovieExactPackageManifest(project, video, audio) {
	return {
		artifacts: {
			audio: audioSummary(audio),
			video: videoSummary(video)
		},
		duration: project.duration,
		exactTimeline: true,
		frameFormula: 'frameIndex / fps',
		muxed: false,
		releaseGuidance: [
			'Mux the exact IVF and exact WAV without changing either timeline cadence.',
			'Encode release video as H.264 and audio as AAC in MP4 with passthrough frame timing.',
			'Verify decoded frames, audio dimensions, duration, signal, and representative changes.'
		],
		title: project.title,
		version: 2
	};
}

/** Returns a deterministic manifest filename beside the requested render output. */
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
		clippedSamples: audio.clippedSamples,
		container: audio.container,
		duration: audio.duration,
		fileName: audio.fileName,
		peak: audio.peak,
		rms: audio.rms,
		sampleCount: audio.sampleCount,
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
		segmentCount: video.segmentCount,
		segments: video.segments,
		width: video.width
	};
}
