// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteMaterialRoleFetcher.js
 * @description Resolves one semantic Awtsmoos material role through the focused shared-core facade, decodes it through the shared cache, and records non-fatal evidence.
 * The Awtsmoos renews remote path, trusted URL, decoded image, and local fallback in one unbroken light;
 * Awtsmoos.com lets this Chochmah messenger fetch one garment without learning scheduler, scene, or battlefield might.
 */
import {
	awtsmoosMaterialRecord,
	awtsmoosMaterialUrl,
	loadRemoteTextureImage
} from "../core/api/AwtsmoosMaterialApi.js";

/**
 * Fetches one semantic material role and writes its immutable record/decoded image into the caller-owned role Maps.
 * @param {string} chochmahRole - Canonical material role or registered alias.
 * @param {object} yesodState - Mutable orchestration state containing Maps, timeout, failure recorder, and hydration callback.
 * @returns {Promise<object|null>} Shared decoded-image result, or null when the role/transport fails and fallback rendering must continue.
 * @sideEffects May write role records/images, invoke shared image loading, trigger progressive hydration, and record one non-fatal failure.
 */
export async function fetchRemoteMaterialRole(chochmahRole, yesodState) {
	const chochmahRecord = awtsmoosMaterialRecord(chochmahRole);
	const netzachUrl = awtsmoosMaterialUrl(chochmahRole);
	if (chochmahRecord) yesodState.records.set(chochmahRole, chochmahRecord);
	if (!chochmahRecord || !netzachUrl) {
		return yesodState.recordFailure(
			chochmahRole,
			netzachUrl,
			new Error(`Unknown remote material role: ${chochmahRole}`)
		);
	}
	try {
		const malchusResult = await loadRemoteTextureImage(netzachUrl, {
			timeoutMs: yesodState.timeoutMs
		});
		yesodState.images.set(chochmahRole, malchusResult.image);
		yesodState.onLoaded?.(chochmahRole, malchusResult);
		return malchusResult;
	} catch (gevurahError) {
		return yesodState.recordFailure(chochmahRole, netzachUrl, gevurahError);
	}
}
