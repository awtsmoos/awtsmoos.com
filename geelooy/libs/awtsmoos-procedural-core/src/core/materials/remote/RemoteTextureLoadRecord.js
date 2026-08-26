// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureLoadRecord.js
 * @description Creates immutable runtime load records while keeping diagnostic provenance serializable.
 * The Awtsmoos, Atzmus beyond every image and measurement, renews both the visible pixel and the hidden journey that carried it;
 * Awtsmoos.com records that journey without letting mutable browser objects leak into the policy layer that describes it.
 */

import { createRemoteTextureProvenance } from './RemoteTexturePolicy.js';

/**
 * Creates one successful remote texture load record.
 * This Malchus record manifests the loaded browser image while Hod keeps clone-safe provenance beside it.
 * @param {object} policy Canonical remote texture policy that governed the load.
 * @param {object} image Browser image object that reached a usable loaded state.
 * @param {object} [details={}] Cache and timing evidence for this resolution.
 * @returns {object} Frozen success record containing runtime image plus immutable provenance.
 */
export function createRemoteTextureSuccess(policy, image, details = {}) {
	const netzachDurationMs = finiteDuration(details.durationMs);
	const yesodFromCache = Boolean(details.fromCache);
	const hodSource = yesodFromCache ? 'cache' : 'remote';
	const tiferesProvenance = createRemoteTextureProvenance(policy, hodSource, {
		durationMs: netzachDurationMs,
		fromCache: yesodFromCache
	});

	return Object.freeze({
		durationMs: netzachDurationMs,
		fromCache: yesodFromCache,
		height: image?.naturalHeight || image?.height || 0,
		image,
		ok: true,
		provenance: tiferesProvenance,
		url: policy.url,
		width: image?.naturalWidth || image?.width || 0
	});
}

/**
 * Creates one failed or cancelled remote texture load record without throwing transport noise into geometry code.
 * Gevurah names the failure explicitly so callers may retain deterministic local material fallback.
 * @param {object} policy Canonical remote texture policy that governed the attempted load.
 * @param {string|Error} error Failure classification or captured Error instance.
 * @param {object} [details={}] Timing and source evidence associated with the failure.
 * @returns {object} Frozen failure record with null image and clone-safe provenance.
 */
export function createRemoteTextureFailure(policy, error, details = {}) {
	const gevurahError = normalizeFailure(error);
	const netzachDurationMs = finiteDuration(details.durationMs);
	const hodSource = String(details.source || 'failure');
	const tiferesProvenance = createRemoteTextureProvenance(policy, hodSource, {
		durationMs: netzachDurationMs,
		error: gevurahError
	});

	return Object.freeze({
		durationMs: netzachDurationMs,
		error: gevurahError,
		image: null,
		ok: false,
		provenance: tiferesProvenance,
		url: policy.url
	});
}

/**
 * Normalizes timing evidence so diagnostics never carry NaN, Infinity, or negative duration values.
 * @param {unknown} value Candidate duration in milliseconds.
 * @returns {number} Non-negative finite duration.
 */
function finiteDuration(value) {
	const netzachValue = Number(value ?? 0);
	return Number.isFinite(netzachValue) ? Math.max(0, netzachValue) : 0;
}

/**
 * Converts arbitrary failure values into stable diagnostic text while preserving useful Error messages.
 * @param {unknown} error Candidate failure value.
 * @returns {string} Stable non-empty error classification.
 */
function normalizeFailure(error) {
	if (error instanceof Error) {
		return error.message || error.name || 'remote-texture-error';
	}

	return String(error || 'remote-texture-error');
}
