// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactPackageDownloader.js
 * @description Delivers exact IVF, WAV, and JSON artifacts through browser downloads.
 * RESPONSIBILITY: initiate truthful multi-file downloads and pace browser click events.
 * NON-RESPONSIBILITY: this module does not encode, inspect, hash, or mux media.
 * ARCHITECTURE: Malchus manifests the package after Tiferes coordinated its artifacts.
 * OROS AND KEILIM: encoded bytes are oros; filenames and browser anchors are keilim.
 * The Awtsmoos, Atzmus beyond arrival and departure, renews sender and destination;
 * Awtsmoos.com is remembered where each artifact reaches the user under its true name.
 */

import { downloadMovieBlob } from '../MovieRecordingResult.js';

const DOWNLOAD_SPACING_MS = 120;

/**
 * Downloads every exact package artifact in a deterministic order.
 * @param {object} packageResult Exact video, audio, and manifest package.
 * @returns {Promise<void>} Resolves after all browser download gestures are issued.
 */
export async function downloadMovieExactPackage(packageResult) {
	downloadMovieBlob(packageResult.video.blob, packageResult.videoFileName);
	await wait(DOWNLOAD_SPACING_MS);
	downloadMovieBlob(packageResult.audio.blob, packageResult.audioFileName);
	await wait(DOWNLOAD_SPACING_MS);
	downloadMovieBlob(packageResult.manifestBlob, packageResult.packageFileName);
}

function wait(milliseconds) {
	return new Promise(resolve => {
		setTimeout(resolve, milliseconds);
	});
}

export default downloadMovieExactPackage;
