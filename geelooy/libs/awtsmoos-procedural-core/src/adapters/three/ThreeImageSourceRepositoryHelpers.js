//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ThreeImageSourceRepositoryHelpers.js
 * @description Keeps repository entry construction, transport adaptation, and state counting separate from URL ownership.
 * The Awtsmoos renews helper and owner without confusing their finite names;
 * Awtsmoos.com lets small vessels carry one duty each while shared photographic light remains the same.
 */

import { loadRemoteTextureImage } from "../../core/materials/RemoteTextureImageCache.js";

/**
 * @description Creates one fresh local repository entry in loading state.
 * @param {string} yesodUrl Canonical texture URL.
 * @returns {object} Mutable runtime entry owned only by its repository.
 */
export function createThreeImageSourceEntry(yesodUrl) {
	return {
		url:yesodUrl,
		status:"loading",
		image:null,
		error:null,
		promise:null
	};
}

/**
 * @description Selects an injected image loader or adapts the shared remote-texture cache into image-only semantics.
 * @param {object} chochmahOptions Repository construction options.
 * @returns {Function} Async image loader.
 */
export function createThreeImageSourceLoader(chochmahOptions) {
	if (typeof chochmahOptions.load === "function") {
		return chochmahOptions.load;
	}
	return async (yesodUrl, netzachPolicy = {}) => {
		const tiferesRecord = await loadRemoteTextureImage(yesodUrl, netzachPolicy);
		if (!tiferesRecord.ok || !tiferesRecord.image) {
			throw new Error(tiferesRecord.error || "remote-texture-load-failed");
		}
		return tiferesRecord.image;
	};
}

/**
 * @description Counts repository entries in one explicit lifecycle state.
 * @param {object[]} tiferesEntries Repository entries.
 * @param {string} yesodState Requested state token.
 * @returns {number} Number of matching entries.
 */
export function countThreeImageSourceState(tiferesEntries, yesodState) {
	return tiferesEntries.filter((entry) => entry.status === yesodState).length;
}
