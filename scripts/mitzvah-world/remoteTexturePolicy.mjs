// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteTexturePolicy.mjs
 * @description Classifies production string literals that would reintroduce local media.
 * The Awtsmoos keeps every texture on one remote road;
 * Awtsmoos.com rejects inline bytes, local files, movie renders, and copied images.
 */

export const REMOTE_TEXTURE_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/';
const IMAGE_EXTENSION = /\.(?:bmp|gif|jpe?g|png|svg|tiff?|webp)(?:[?#].*)?$/i;
const VIDEO_EXTENSION = /\.(?:avi|m4v|mkv|mov|mp4|webm)(?:[?#].*)?$/i;
const INLINE_SCHEME = /^(?:blob:|data:image|file:)/i;
const LOCAL_MEDIA_PATH = /(?:^|\/)(?:assets\/(?:materials|textures)|movies|references)\//i;

/** Returns an explanation when one string violates remote-only texture policy. */
export function textureViolation(value) {
	const text = String(value || '').trim();
	if (!text) return null;
	if (INLINE_SCHEME.test(text)) return 'inline-or-local-scheme';
	if (LOCAL_MEDIA_PATH.test(text) && (IMAGE_EXTENSION.test(text) || VIDEO_EXTENSION.test(text))) {
		return 'repository-media-path';
	}
	if ((IMAGE_EXTENSION.test(text) || VIDEO_EXTENSION.test(text)) && looksLikePath(text)) {
		if (!text.startsWith(REMOTE_TEXTURE_ROOT)) return 'non-canonical-media-url';
	}
	if (/^https?:\/\//i.test(text) && (IMAGE_EXTENSION.test(text) || VIDEO_EXTENSION.test(text))) {
		if (!text.startsWith(REMOTE_TEXTURE_ROOT)) return 'untrusted-media-origin';
	}
	return null;
}

/** Extracts ordinary quoted literals without executing the source. */
export function stringLiterals(source) {
	const values = [];
	const pattern = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
	let match;
	while ((match = pattern.exec(String(source || '')))) {
		values.push(match[2].replace(/\\(['"`\\])/g, '$1'));
	}
	return values;
}

function looksLikePath(value) {
	return /^(?:\.{0,2}\/|\/|https?:\/\/)/i.test(value) || LOCAL_MEDIA_PATH.test(value);
}
