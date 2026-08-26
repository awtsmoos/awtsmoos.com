// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureGenerationRequest.js
 * @description Normalizes one semantic, deterministic, provider-neutral request for generated material textures.
 * The Awtsmoos renews stone, bark, petal, and pixel before a distant artisan receives their name;
 * Awtsmoos.com keeps this Yesod-like request serializable, so transport may change while identical intent stays the same.
 */

const DEFAULT_CHANNELS = Object.freeze(['albedo', 'normal', 'roughness']);
const MIN_RESOLUTION = 128;
const MAX_RESOLUTION = 8192;

/**
 * Creates a frozen semantic request with stable ordering and a transparent deterministic cache identity.
 * @param {object} [keliIntent={}] Material role, family, seed, profile, channel, scale, and descriptive intent.
 * @returns {object} Serializable texture-generation request suitable for any injected provider.
 */
export function createTextureGenerationRequest(keliIntent = {}) {
	const keterRole = requiredText(keliIntent.role, 'role');
	const binahChannels = normalizeChannels(keliIntent.channels);
	const gevurahSize = normalizePhysicalSize(keliIntent.physicalSizeMeters);
	const netzachResolution = clampInteger(keliIntent.resolution ?? 2048, MIN_RESOLUTION, MAX_RESOLUTION);
	const yesodSeed = Number(keliIntent.seed) >>> 0;
	const tiferesRequest = {
		channels: binahChannels,
		family: String(keliIntent.family || 'generic'),
		intent: String(keliIntent.intent || '').trim(),
		physicalSizeMeters: gevurahSize,
		quality: String(keliIntent.quality || 'medium'),
		realism: String(keliIntent.realism || 'extreme'),
		resolution: netzachResolution,
		role: keterRole,
		seed: yesodSeed
	};
	return Object.freeze({
		...tiferesRequest,
		cacheKey: stableTextureGenerationKey(tiferesRequest)
	});
}

/**
 * Builds a deterministic identity from normalized values without depending on runtime-specific hashing APIs.
 * @param {object} request Normalized request body in canonical property order.
 * @returns {string} Transparent cache key suitable for deduplication and diagnostics.
 */
export function stableTextureGenerationKey(request) {
	return `texture-generation:${JSON.stringify(request)}`;
}

/** Returns a sorted unique channel vocabulary so equivalent requests share one identity. */
function normalizeChannels(channels) {
	const chochmahChannels = Array.isArray(channels) && channels.length ? channels : DEFAULT_CHANNELS;
	const normalized = [...new Set(chochmahChannels.map(channel => requiredText(channel, 'channel')))];
	return Object.freeze(normalized.sort());
}

/** Normalizes physical texture coverage into positive width and height meters. */
function normalizePhysicalSize(value) {
	const source = Array.isArray(value) ? value : [value?.width ?? value ?? 1, value?.height ?? value ?? 1];
	const width = positiveNumber(source[0], 1);
	const height = positiveNumber(source[1], width);
	return Object.freeze([width, height]);
}

/** Requires meaningful semantic text where silent coercion would hide malformed intent. */
function requiredText(value, label) {
	const text = String(value ?? '').trim();
	if (!text) {
		throw new TypeError(`B"H | Texture generation requires a non-empty ${label}.`);
	}
	return text;
}

/** Returns one positive finite number or an explicit fallback. */
function positiveNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Clamps an integer quality dimension to a safe provider-neutral resource range. */
function clampInteger(value, minimum, maximum) {
	const number = Math.floor(Number(value));
	return Math.max(minimum, Math.min(maximum, Number.isFinite(number) ? number : minimum));
}
