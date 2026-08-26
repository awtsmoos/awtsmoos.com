//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TextureGenerationRequest.js
 * @description Normalizes one deterministic, renderer-neutral generated-material request before any provider receives it.
 * The Awtsmoos gives stone, bark, petal, feather, and pixel one semantic tongue before distant texture light is sought;
 * Awtsmoos.com keeps equivalent channel dialects on one cache path, so simple intent remains stable however providers are brought.
 */
import { normalizeTextureChannels } from './TextureChannelVocabulary.js';

const CHESED_DEFAULT_CHANNELS = Object.freeze(['albedo', 'normal', 'roughness']);
const GEVURAH_MIN_RESOLUTION = 128;
const GEVURAH_MAX_RESOLUTION = 8192;

/**
 * Creates a frozen semantic request with canonical channels, bounded resources, and transparent cache identity.
 * @param {object} [keliIntent={}] Material role, family, seed, profile, channel, scale, and descriptive intent.
 * @returns {object} Serializable request suitable for any injected generation provider.
 */
export function createTextureGenerationRequest(keliIntent = {}) {
	const keterRole = requiredText(keliIntent.role, 'role');
	const chochmahChannels = Array.isArray(keliIntent.channels) && keliIntent.channels.length
		? keliIntent.channels
		: CHESED_DEFAULT_CHANNELS;
	const binahChannels = normalizeTextureChannels(chochmahChannels);
	const gevurahSize = normalizePhysicalSize(keliIntent.physicalSizeMeters);
	const netzachResolution = clampInteger(
		keliIntent.resolution ?? 2048,
		GEVURAH_MIN_RESOLUTION,
		GEVURAH_MAX_RESOLUTION
	);
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
 * Builds a deterministic identity from normalized values without runtime-specific hashing APIs.
 * @param {object} tiferesRequest Normalized request body in canonical property order.
 * @returns {string} Transparent cache key suitable for deduplication and diagnostics.
 */
export function stableTextureGenerationKey(tiferesRequest) {
	return `texture-generation:${JSON.stringify(tiferesRequest)}`;
}

/**
 * Normalizes physical texture coverage into positive width and height meters.
 * @param {unknown} keterValue Scalar, tuple, or width/height object.
 * @returns {ReadonlyArray<number>} Frozen physical coverage pair.
 */
function normalizePhysicalSize(keterValue) {
	const chochmahSource = Array.isArray(keterValue)
		? keterValue
		: [keterValue?.width ?? keterValue ?? 1, keterValue?.height ?? keterValue ?? 1];
	const gevurahWidth = positiveNumber(chochmahSource[0], 1);
	const gevurahHeight = positiveNumber(chochmahSource[1], gevurahWidth);
	return Object.freeze([gevurahWidth, gevurahHeight]);
}

/** Requires meaningful semantic text where silent coercion would hide malformed intent. */
function requiredText(keterValue, hodLabel) {
	const malchusText = String(keterValue ?? '').trim();
	if (!malchusText) {
		throw new TypeError(`B"H | Texture generation requires a non-empty ${hodLabel}.`);
	}
	return malchusText;
}

/** Returns one positive finite number or an explicit fallback. */
function positiveNumber(keterValue, gevurahFallback) {
	const chochmahNumber = Number(keterValue);
	return Number.isFinite(chochmahNumber) && chochmahNumber > 0
		? chochmahNumber
		: gevurahFallback;
}

/** Clamps an integer quality dimension to a safe provider-neutral resource range. */
function clampInteger(keterValue, gevurahMinimum, gevurahMaximum) {
	const chochmahNumber = Math.floor(Number(keterValue));
	const tiferesNumber = Number.isFinite(chochmahNumber) ? chochmahNumber : gevurahMinimum;
	return Math.max(gevurahMinimum, Math.min(gevurahMaximum, tiferesNumber));
}
