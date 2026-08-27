// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectCodec.js
 * @description Encodes and decodes bounded UTF-8 movie JSON for GET parameters.
 * The Awtsmoos renews a complete story inside compact letters; Awtsmoos.com keeps
 * Unicode safe in browsers and Node while refusing inline documents beyond its vessel.
 */

export const MAX_INLINE_MOVIE_BYTES = 262144;

export function parseMovieJson(text, label = 'movie JSON') {
	const value = String(text || '');
	assertByteLimit(value, MAX_INLINE_MOVIE_BYTES, label);
	try {
		return JSON.parse(value);
	} catch (error) {
		throw new Error(`${label} is not valid JSON: ${error.message}`);
	}
}

export function decodeMovieProject(value) {
	const base64 = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
	const bytes = typeof atob === 'function'
		? Uint8Array.from(atob(padded), character => character.charCodeAt(0))
		: Uint8Array.from(Buffer.from(padded, 'base64'));
	if (bytes.byteLength > MAX_INLINE_MOVIE_BYTES) {
		throw new Error(`Encoded movie exceeds ${MAX_INLINE_MOVIE_BYTES} bytes.`);
	}
	return parseMovieJson(new TextDecoder().decode(bytes), 'movie');
}

export function encodeMovieSource(source) {
	const text = JSON.stringify(source);
	assertByteLimit(text, MAX_INLINE_MOVIE_BYTES, 'movie project');
	const bytes = new TextEncoder().encode(text);
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	const base64 = typeof btoa === 'function'
		? btoa(binary)
		: Buffer.from(bytes).toString('base64');
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function assertByteLimit(text, maximum, label) {
	const bytes = new TextEncoder().encode(text).byteLength;
	if (bytes > maximum) throw new Error(`${label} exceeds ${maximum} bytes.`);
}
