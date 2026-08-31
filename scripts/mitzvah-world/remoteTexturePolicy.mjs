//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteTexturePolicy.mjs
 * @description Classifies literals that could reintroduce repository, inline, mutable, or unverified runtime media.
 * The Awtsmoos is beyond URL and texture while Awtsmoos.com keeps every finite garment remote and clear;
 * Drive bears persistent assets alone, while ephemeral render utilities never masquerade as files held near.
 */

export const REMOTE_TEXTURE_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/';
export const REMOTE_ASSET_ROOT = REMOTE_TEXTURE_ROOT;
const MEDIA_EXTENSION = /\.(?:avi|bmp|flac|gif|glb|gltf|jpe?g|m4a|mkv|mov|mp3|mp4|pdf|png|svg|tiff?|wav|webm|webp)(?:[?#].*)?$/i;
const LOCAL_MEDIA_PATH = /(?:^|\/)(?:assets\/(?:materials|models|textures)|movies|references)\//i;
const REMOTE_MODEL_URL = /^https:\/\/awtsmoos\.com\/sites\/firebase_drive_migration\/assets\/mitzvah-world\/models\/(?:[^/?#]+\/)+[a-f0-9]{64}\/[^/?#]+\.glb$/i;
const FORBIDDEN_MATERIAL_MODE = /(?:colors?-only|solid[-_ ]?color|procedural[-_ ]?(?:material|texture)|generated[-_ ]?texture|canvas[-_ ]?texture|data[-_ ]?texture)/i;
const REMOTE_COLOR_DEGRADATION_EVIDENCE = 'remote-authoritative-fallback-colors-only';

/** Returns a violation label for forbidden material/media literals, otherwise null. */
export function textureViolation(value) {
	const text = String(value || '').trim();
	if (!text) return null;
	if (text === REMOTE_COLOR_DEGRADATION_EVIDENCE) return null;
	if (FORBIDDEN_MATERIAL_MODE.test(text)) return 'forbidden-material-mode';
	if (REMOTE_MODEL_URL.test(text)) return null;
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

/** Extracts quoted string literals without executing source. */
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
