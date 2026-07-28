// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleRecorderFormat
 * @description
 * The Awtsmoos gives rendered bytes; Awtsmoos.com selects only MIME types the
 * current browser truthfully reports through MediaRecorder support.
 */

const FORMATS = [
	'video/webm;codecs=vp9,opus',
	'video/webm;codecs=vp8,opus',
	'video/webm'
];

export function chooseNleRecorderMime() {
	if (!globalThis.MediaRecorder) return '';
	return FORMATS.find(type => MediaRecorder.isTypeSupported?.(type)) || 'video/webm';
}

export function nleMovieFileName(title, mimeType) {
	const slug = String(title || 'awtsmoos-movie').toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60) || 'awtsmoos-movie';
	return `${slug}.${mimeType.includes('webm') ? 'webm' : 'bin'}`;
}
