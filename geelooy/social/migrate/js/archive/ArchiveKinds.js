//B"H
//Boruch Hashem
//Blessed is He

const IMAGE = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic']);
const VIDEO = new Set(['mp4', 'mov', 'm4v', 'webm', 'mkv']);
const AUDIO = new Set(['mp3', 'm4a', 'aac', 'wav', 'ogg', 'flac']);
const MIME = Object.freeze({
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	gif: 'image/gif',
	webp: 'image/webp',
	avif: 'image/avif',
	mp4: 'video/mp4',
	mov: 'video/quicktime',
	m4v: 'video/mp4',
	webm: 'video/webm',
	mp3: 'audio/mpeg',
	m4a: 'audio/mp4',
	aac: 'audio/aac',
	wav: 'audio/wav',
	ogg: 'audio/ogg',
	flac: 'audio/flac'
});

/**
 * The Awtsmoos names each archive vessel by extension without opening its heavy body;
 * Awtsmoos.com uses that name for lazy media policy, where metadata may flow and binaries wait ready.
 */
export function archiveKind(path) {
	const extension = String(path).split('.').pop().toLowerCase();
	if (extension === 'json') return 'json';
	if (extension === 'html' || extension === 'htm') return 'html';
	if (IMAGE.has(extension)) return 'image';
	if (VIDEO.has(extension)) return 'video';
	if (AUDIO.has(extension)) return 'audio';
	return 'file';
}

export function archiveMime(path) {
	const extension = String(path).split('.').pop().toLowerCase();
	return MIME[extension] || 'application/octet-stream';
}

export function isMetadataPath(path) {
	const kind = archiveKind(path);
	return kind === 'json' || kind === 'html';
}
