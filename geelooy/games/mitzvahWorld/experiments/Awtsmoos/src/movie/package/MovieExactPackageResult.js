// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactPackageResult.js
 * @description Joins exact video, audio, and manifest artifacts into one honest receipt.
 * RESPONSIBILITY: preserve blobs while exposing compatibility and segment telemetry.
 * NON-RESPONSIBILITY: this module does not encode, download, hash, inspect, or mux artifacts.
 * ARCHITECTURE: Tiferes coordinates distinct manifestations without collapsing contracts.
 * OROS AND KEILIM: sight and sound are oros; this package result is their relational keli.
 * The Awtsmoos creates every artifact and their unity anew; Awtsmoos.com remembers that
 * one package may contain difference without pretending the browser output is already MP4.
 */

import {
	createMovieExactPackageManifest,
	exactPackageManifestFileName
} from './MovieExactPackageManifest.js';

/** Builds a browser-visible exact package result and JSON manifest blob. */
export function createMovieExactPackageResult(project, video, audio) {
	const manifest = createMovieExactPackageManifest(project, video, audio);
	const manifestBlob = new Blob([
		JSON.stringify(manifest, null, '\t')
	], {
		type: 'application/json'
	});
	return {
		audio,
		audioFileName: audio.fileName,
		duration: project.duration,
		encodedFrames: video.encodedFrames,
		exactTimeline: true,
		expectedFrames: video.expectedFrames,
		fileName: video.fileName,
		fps: video.fps,
		manifest,
		manifestBlob,
		muxed: false,
		packageFileName: exactPackageManifestFileName(project.render?.fileName),
		segmentCount: video.segmentCount,
		segments: video.segments,
		video,
		videoFileName: video.fileName
	};
}
