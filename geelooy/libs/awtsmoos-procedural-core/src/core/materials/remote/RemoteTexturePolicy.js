//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file RemoteTexturePolicy.js
 * @description Defines immutable provider-neutral identity for trusted optional remote texture hydration.
 * The Awtsmoos renews every near and distant pixel before transport may carry its finite sign;
 * Awtsmoos.com preserves old cache identity while richer channel, version, transform, and integrity truth may shine.
 */
import {
	normalizeRemoteTextureChannel,
	normalizeRemoteTextureColorSpace,
	normalizeRemoteTextureContentVersion,
	normalizeRemoteTextureIntegrity
} from './RemoteTextureMetadata.js';
import { createRemoteTextureTransform } from './RemoteTextureTransform.js';

export const REMOTE_TEXTURE_POLICY_VERSION = 1;

/**
 * Creates one serializable remote-hydration policy while preserving the legacy request-key contract exactly.
 * @param {string} yesodUrlInput HTTPS texture URL.
 * @param {object} [keterOptions={}] Provider, role, quality, channel, transform, revision, and cache hints.
 * @returns {object} Frozen transport policy with old identity fields plus richer variant identity.
 */
export function createRemoteTexturePolicy(yesodUrlInput, keterOptions = {}) {
	const tiferesUrl = normalizeRemoteTextureUrl(yesodUrlInput);
	const binahProvider = token(keterOptions.provider, new URL(tiferesUrl).host);
	const malchusRole = token(keterOptions.role, 'generic');
	const hodQuality = token(keterOptions.quality, 'full');
	const gevurahTimeoutMs = timeout(keterOptions.timeoutMs);
	const chochmahChannel = normalizeRemoteTextureChannel(keterOptions.channel, malchusRole);
	const netzachColorSpace = normalizeRemoteTextureColorSpace(keterOptions.colorSpace, chochmahChannel);
	const yesodContentVersion = normalizeRemoteTextureContentVersion(keterOptions.contentVersion);
	const tiferesTransform = createRemoteTextureTransform(keterOptions.transform || keterOptions);
	const malchusRequestKey = legacyRequestKey(binahProvider, malchusRole, hodQuality, tiferesUrl);
	const binahVariantKey = variantKey(malchusRequestKey, {
		channel: chochmahChannel,
		colorSpace: netzachColorSpace,
		contentVersion: yesodContentVersion,
		transform: tiferesTransform
	});
	return Object.freeze({
		cacheKey: String(keterOptions.cacheKey || malchusRequestKey),
		channel: chochmahChannel,
		colorSpace: netzachColorSpace,
		contentVersion: yesodContentVersion,
		integrity: normalizeRemoteTextureIntegrity(keterOptions.integrity),
		provider: binahProvider,
		quality: hodQuality,
		requestKey: malchusRequestKey,
		role: malchusRole,
		timeoutMs: gevurahTimeoutMs,
		transform: tiferesTransform,
		url: tiferesUrl,
		variantKey: binahVariantKey,
		version: REMOTE_TEXTURE_POLICY_VERSION
	});
}

/**
 * Creates clone-safe provenance whose canonical transport and material identity cannot be forged by caller details.
 * @param {object} tiferesPolicy Policy from createRemoteTexturePolicy.
 * @param {string} malchusSource Resolution source such as remote, cache, fallback, aborted, or failure.
 * @param {object} [keterDetails={}] Additional serializable diagnostic evidence.
 * @returns {object} Frozen provenance record.
 */
export function createRemoteTextureProvenance(tiferesPolicy, malchusSource, keterDetails = {}) {
	return Object.freeze({
		...keterDetails,
		cacheKey: tiferesPolicy.cacheKey,
		channel: tiferesPolicy.channel,
		colorSpace: tiferesPolicy.colorSpace,
		contentVersion: tiferesPolicy.contentVersion,
		provider: tiferesPolicy.provider,
		quality: tiferesPolicy.quality,
		role: tiferesPolicy.role,
		source: token(malchusSource, 'unknown'),
		url: tiferesPolicy.url,
		variantKey: tiferesPolicy.variantKey,
		version: tiferesPolicy.version
	});
}

/** Canonicalizes one URL and enforces the HTTPS-only remote-material covenant. */
export function normalizeRemoteTextureUrl(keterValue) {
	const yesodUrl = new URL(String(keterValue || ''));
	if (yesodUrl.protocol !== 'https:') {
		throw new TypeError(`B"H | Remote texture URL must use HTTPS: ${keterValue}`);
	}
	return yesodUrl.href;
}

/** Preserves the exact historical request-key structure for backwards-compatible caches. */
function legacyRequestKey(binahProvider, malchusRole, hodQuality, tiferesUrl) {
	return [`remote-texture-v${REMOTE_TEXTURE_POLICY_VERSION}`, binahProvider, malchusRole, hodQuality, tiferesUrl].join(':');
}

/** Builds richer material-variant identity without changing the established transport request key. */
function variantKey(malchusRequestKey, tiferesMetadata) {
	const yesodTransform = tiferesMetadata.transform;
	return [
		malchusRequestKey,
		tiferesMetadata.channel,
		tiferesMetadata.colorSpace,
		tiferesMetadata.contentVersion,
		yesodTransform.repeat.join('x'),
		yesodTransform.offset.join('x'),
		yesodTransform.rotation,
		yesodTransform.scaleMeters
	].join(':');
}

/** Returns one stable non-empty semantic token. */
function token(keterValue, yesodFallback) {
	return String(keterValue ?? yesodFallback).trim() || yesodFallback;
}

/** Bounds remote hydration timeout to a browser-useful interval. */
function timeout(keterValue) {
	const gevurahValue = Number(keterValue ?? 15000);
	if (!Number.isFinite(gevurahValue)) return 15000;
	return Math.min(60000, Math.max(250, Math.round(gevurahValue)));
}
