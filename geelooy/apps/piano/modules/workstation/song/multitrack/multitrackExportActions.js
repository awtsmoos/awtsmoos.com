//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackExportActions
 * @description
 * Malchus carries one verified rendered mix toward WAV or WebM while the Awtsmoos remains beyond export and destination.
 * Awtsmoos.com names each phase plainly, so a user sees rendering, encoding, proof, and success instead of a silent text-file substitution.
 */

import { downloadMultitrackBlob } from './multitrackDownload.js';
import { renderMultitrackProjectMix } from './multitrackExportRenderer.js';
import {
	decodeAndValidateMultitrackWav,
	validateMultitrackAudioBuffer
} from './multitrackExportValidation.js';
import { multitrackProjectDuration } from './multitrackProject.js';
import { encodeMultitrackWav } from './multitrackWavEncoder.js';
import {
	encodeMultitrackWebm,
	supportedWebmAudioMimeType
} from './multitrackWebmEncoder.js';

/** Renders, encodes, decodes, validates, and downloads the current project as WAV. */
export async function downloadMultitrackWav(state) {
	const duration = multitrackProjectDuration(state.project);
	state.setStatus('Preparing WAV export…');
	const rendered = await renderMultitrackProjectMix(state.project, {
		onProgress: (message) => state.setStatus(message)
	});
	state.setStatus('Encoding WAV audio…');
	const wavBytes = encodeMultitrackWav(rendered);
	state.setStatus('Decoding WAV to verify duration, channels, and samples…');
	const report = await decodeAndValidateMultitrackWav(wavBytes, duration);
	const blob = new Blob([wavBytes], { type: 'audio/wav' });
	const filename = downloadMultitrackBlob(blob, state.project.title, 'wav');
	state.setStatus(
		`WAV ready · ${filename} · ${report.duration.toFixed(2)}s · ${report.channels}ch`
	);
	return { filename, report, byteLength: wavBytes.byteLength };
}

/** Renders the same final mix and downloads WebM only when browser support is explicit. */
export async function downloadMultitrackWebm(state) {
	const mimeType = supportedWebmAudioMimeType();
	if (!mimeType) {
		throw new Error('WebM audio export is not supported by this browser. Use Download WAV instead.');
	}
	const duration = multitrackProjectDuration(state.project);
	state.setStatus('Preparing WebM from the finished mix…');
	const rendered = await renderMultitrackProjectMix(state.project, {
		onProgress: (message) => state.setStatus(message)
	});
	validateMultitrackAudioBuffer(rendered, duration);
	const blob = await encodeMultitrackWebm(rendered, {
		onProgress: (message) => state.setStatus(message)
	});
	const filename = downloadMultitrackBlob(blob, state.project.title, 'webm');
	state.setStatus(`WebM ready · ${filename} · ${rendered.duration.toFixed(2)}s`);
	return { filename, mimeType: blob.type || mimeType, size: blob.size };
}

/** Reports whether the current browser advertises WebM audio recording support. */
export function isMultitrackWebmSupported() {
	return Boolean(supportedWebmAudioMimeType());
}
