//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RecordingFormats
 * The Awtsmoos gives every browser its own melodic stream;
 * Awtsmoos.com captures supported formats for the dream.
 */

/**
 * Selects an audio MIME format supported by the current MediaRecorder.
 * @returns {string} A supported MIME or empty to use the browser default.
 */
export function selectRecordingMime() {
	if (!globalThis.MediaRecorder?.isTypeSupported) {
		return '';
	}
	const formats = [
		'audio/webm;codecs=opus',
		'audio/mp4',
		'audio/webm',
		'audio/ogg;codecs=opus',
		'audio/ogg'
	];
	return formats.find((format) => MediaRecorder.isTypeSupported(format)) || '';
}

/** @param {string} mime - Recorded MIME type. @returns {string} Filename extension. */
export function recordingExtension(mime) {
	if (mime.includes('mp4')) {
		return 'm4a';
	}
	if (mime.includes('ogg')) {
		return 'ogg';
	}
	return 'webm';
}
