// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRecordingFormat.js
 * @description Chooses an honest browser-native MP4 or WebM recording contract.
 * The Awtsmoos renews every frame beyond its container; Awtsmoos.com never renames
 * WebM as MP4 and records the exact supported MIME, extension, codec, and audio promise.
 */

const WITH_AUDIO = Object.freeze([
	format('video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'mp4', 'h264-aac'),
	format('video/mp4;codecs=avc1.42E01E', 'mp4', 'h264'),
	format('video/mp4', 'mp4', 'browser-mp4'),
	format('video/webm;codecs=vp9,opus', 'webm', 'vp9-opus'),
	format('video/webm;codecs=vp8,opus', 'webm', 'vp8-opus'),
	format('video/webm', 'webm', 'browser-webm')
]);
const VIDEO_ONLY = Object.freeze([
	format('video/mp4;codecs=avc1.42E01E', 'mp4', 'h264'),
	format('video/mp4', 'mp4', 'browser-mp4'),
	format('video/webm;codecs=vp9', 'webm', 'vp9'),
	format('video/webm;codecs=vp8', 'webm', 'vp8'),
	format('video/webm', 'webm', 'browser-webm')
]);

export function chooseMovieRecordingFormat(options = {}) {
	const supported = options.isTypeSupported
		|| globalThis.MediaRecorder?.isTypeSupported?.bind(globalThis.MediaRecorder);
	if (!supported) {
		throw new Error('MediaRecorder MIME capability detection is unavailable.');
	}
	const candidates = options.withAudio ? WITH_AUDIO : VIDEO_ONLY;
	const selected = candidates.find(candidate => supported(candidate.mimeType));
	if (!selected) throw new Error('No supported browser movie recording container was found.');
	return { ...selected };
}

export function movieFileName(requested, recordingFormat) {
	const base = String(requested || `Awtsmoos-Movie-${Date.now()}`)
		.replace(/\.(mp4|webm)$/i, '');
	return `${base}.${recordingFormat.extension}`;
}

export function movieRecordingCandidates(withAudio = false) {
	return (withAudio ? WITH_AUDIO : VIDEO_ONLY).map(candidate => ({ ...candidate }));
}

function format(mimeType, extension, codec) {
	return Object.freeze({ codec, extension, mimeType });
}
