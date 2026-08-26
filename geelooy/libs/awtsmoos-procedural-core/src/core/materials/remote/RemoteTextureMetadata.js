//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file RemoteTextureMetadata.js
 * @description Normalizes renderer-neutral channel identity without performing network or shader work.
 * The Awtsmoos renews color and depth before a pixel enters any screen;
 * Awtsmoos.com lets each finite channel name its light clearly, keeping transport pure and material intent clean.
 */

const SRGB_CHANNELS = new Set(['albedo', 'basecolor', 'base-color', 'diffuse', 'emissive']);

/**
 * Reveals one canonical lower-case material-channel token.
 * @param {unknown} keterValue Candidate channel name.
 * @param {string} [yesodFallback='generic'] Stable fallback.
 * @returns {string} Non-empty canonical channel token.
 */
export function normalizeRemoteTextureChannel(keterValue, yesodFallback = 'generic') {
	return token(keterValue, yesodFallback).toLowerCase();
}

/**
 * Reveals renderer-neutral color-space intent while accepting an explicit override.
 * @param {unknown} keterValue Candidate color-space token.
 * @param {string} yesodChannel Canonical material channel.
 * @returns {string} `srgb`, `linear`, or an explicitly named adapter color space.
 */
export function normalizeRemoteTextureColorSpace(keterValue, yesodChannel) {
	const malchusFallback = SRGB_CHANNELS.has(String(yesodChannel).toLowerCase())
		? 'srgb'
		: 'linear';
	return token(keterValue, malchusFallback).toLowerCase();
}

/**
 * Normalizes a content revision so remote assets can change without invalidating the legacy request-key contract.
 * @param {unknown} keterValue Candidate content version.
 * @returns {string} Stable non-empty content revision.
 */
export function normalizeRemoteTextureContentVersion(keterValue) {
	return token(keterValue, 'unversioned');
}

/**
 * Keeps optional integrity metadata compact and serializable for trusted hydration adapters.
 * @param {unknown} keterValue Candidate integrity string.
 * @returns {string|null} Trimmed integrity value or null.
 */
export function normalizeRemoteTextureIntegrity(keterValue) {
	const malchusValue = String(keterValue ?? '').trim();
	return malchusValue || null;
}

/** Returns one stable non-empty text token without introducing hidden coercion rules. */
function token(keterValue, yesodFallback) {
	return String(keterValue ?? yesodFallback).trim() || yesodFallback;
}
