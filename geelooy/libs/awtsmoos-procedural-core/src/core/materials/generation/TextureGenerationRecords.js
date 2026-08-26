//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TextureGenerationRecords.js
 * @description Builds immutable renderer-neutral generation records after provider work has ended.
 * The Awtsmoos gathers success and failure into one truthful vessel where channel evidence can plainly appear;
 * Awtsmoos.com keeps record shaping apart from network orchestration, so each responsibility remains small and clear.
 */
import { createTextureChannelManifest } from './TextureChannelManifest.js';

/**
 * Creates canonical generated evidence from provider output while allowing useful partial channel coverage.
 * @param {object} tiferesRequest Normalized semantic request.
 * @param {unknown} chochmahRaw Provider result.
 * @param {string} yesodProviderName Installed provider name.
 * @returns {Readonly<object>} Frozen generated result.
 */
export function createTextureSuccessRecord(tiferesRequest, chochmahRaw, yesodProviderName) {
	const binahAssets = chochmahRaw?.assets ?? chochmahRaw?.channels ?? chochmahRaw;
	const tiferesManifest = createTextureChannelManifest({
		assets: binahAssets,
		requested: tiferesRequest.channels
	});
	if (!tiferesManifest.provided.length) {
		throw new TypeError('B"H | Texture provider returned no serializable asset descriptors.');
	}
	return Object.freeze({
		assets: tiferesManifest.assets,
		cacheKey: tiferesRequest.cacheKey,
		channels: tiferesManifest.coverage(),
		metadata: freezeTextureMetadata(chochmahRaw?.metadata),
		provider: String(chochmahRaw?.provider || yesodProviderName),
		status: 'generated'
	});
}

/**
 * Creates nonthrowing failure evidence while preserving requested channels for fallback composition.
 * @param {string} malchusStatus Failure state.
 * @param {object} tiferesRequest Normalized request.
 * @param {unknown} hodReason Inspectable failure reason.
 * @param {string|null} yesodProvider Provider identity when known.
 * @returns {Readonly<object>} Frozen failure result.
 */
export function createTextureFailureRecord(
	malchusStatus,
	tiferesRequest,
	hodReason,
	yesodProvider
) {
	const tiferesManifest = createTextureChannelManifest({
		assets: {},
		requested: tiferesRequest.channels
	});
	return Object.freeze({
		assets: tiferesManifest.assets,
		cacheKey: tiferesRequest.cacheKey,
		channels: tiferesManifest.coverage(),
		metadata: Object.freeze({}),
		provider: yesodProvider,
		reason: String(hodReason || malchusStatus),
		status: malchusStatus
	});
}

/**
 * Keeps shallow JSON-safe provider metadata so renderer objects never leak into procedural-core results.
 * @param {object} [hodSource={}] Provider metadata.
 * @returns {Readonly<Record<string, unknown>>} Frozen primitive metadata.
 */
export function freezeTextureMetadata(hodSource = {}) {
	const malchusMetadata = {};
	for (const [yesodKey, tiferesValue] of Object.entries(hodSource || {})) {
		const netzachPrimitive = ['string', 'number', 'boolean'].includes(typeof tiferesValue)
			|| tiferesValue === null;
		if (netzachPrimitive) {
			malchusMetadata[String(yesodKey)] = tiferesValue;
		}
	}
	return Object.freeze(malchusMetadata);
}
