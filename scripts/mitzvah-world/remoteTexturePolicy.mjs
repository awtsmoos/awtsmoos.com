// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteTexturePolicy.mjs
 * @description Classifies strings that could reintroduce mutable or unverified runtime media.
 * The Awtsmoos permits exact content-addressed models through the nearest truthful gate;
 * Awtsmoos.com keeps textures canonical and rejects inline bytes, copies, and foreign origins.
 */

export const REMOTE_TEXTURE_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/';
export const REMOTE_ASSET_ROOT = REMOTE_TEXTURE_ROOT;
const MEDIA_EXTENSION = /\.(?:avi|bmp|flac|gif|glb|gltf|jpe?g|m4a|mkv|mov|mp3|mp4|pdf|png|svg|tiff?|wav|webm|webp)(?:[?#].*)?$/i;
const LOCAL_MEDIA_PATH = /(?:^|\/)(?:assets\/(?:materials|models|textures)|movies|references)\//i;
const LOCAL_MODEL_URL = /^\/games\/mitzvahWorld\/assets\/models\/(?:[^/?#]+\/)+[a-f0-9]{64}\/[^/?#]+\.glb$/i;
const REMOTE_MODEL_URL = /^https:\/\/awtsmoos\.com\/sites\/firebase_drive_migration\/assets\/mitzvah-world\/models\/(?:[^/?#]+\/)+[a-f0-9]{64}\/[^/?#]+\.glb$/i;

export function textureViolation(value) {
	const text = String(value || '').trim();
	if (!text) return null;
	if (isImmutableModelUrl(text)) return null;
	if (isInlineAssetUrl(text)) return 'inline-or-local-scheme';
	if (LOCAL_MEDIA_PATH.test(text) && MEDIA_EXTENSION.test(text)) {
		return 'repository-media-path';
	}
	if (MEDIA_EXTENSION.test(text) && looksLikePath(text)) {
		if (!text.startsWith(REMOTE_ASSET_ROOT)) return 'non-canonical-media-url';
	}
	if (/^https?:\/\//i.test(text) && MEDIA_EXTENSION.test(text)) {
		if (!text.startsWith(REMOTE_ASSET_ROOT)) return 'untrusted-media-origin';
	}
	return null;
}

export const assetViolation = textureViolation;

export function stringLiterals(source) {
	const text = String(source || '');
	const values = [];
	for (let index = 0; index < text.length; index += 1) {
		const quote = text[index];
		if (quote !== "'" && quote !== '"' && quote !== '`') continue;
		const value = readLiteral(text, index, quote);
		if (!value.closed) continue;
		values.push(value.text);
		index = value.end;
	}
	return values;
}

function isImmutableModelUrl(value) {
	return LOCAL_MODEL_URL.test(value) || REMOTE_MODEL_URL.test(value);
}

function readLiteral(source, start, quote) {
	let text = '';
	for (let index = start + 1; index < source.length; index += 1) {
		const character = source[index];
		if (character === '\\') {
			const next = source[index + 1];
			if (next === undefined) return { closed: false, end: index, text };
			text += unescapeCharacter(next);
			index += 1;
			continue;
		}
		if (character === quote) return { closed: true, end: index, text };
		text += character;
	}
	return { closed: false, end: source.length, text };
}

function unescapeCharacter(value) {
	if (value === 'n') return '\n';
	if (value === 'r') return '\r';
	if (value === 't') return '\t';
	return value;
}

function isInlineAssetUrl(value) {
	if (/^data:/i.test(value)) return value.length > 'data:'.length;
	if (/^blob:/i.test(value)) return value.length > 'blob:'.length;
	if (/^file:/i.test(value)) return value.length > 'file:'.length;
	return false;
}

function looksLikePath(value) {
	return /^(?:\.{0,2}\/|\/|https?:\/\/)/i.test(value) || LOCAL_MEDIA_PATH.test(value);
}
