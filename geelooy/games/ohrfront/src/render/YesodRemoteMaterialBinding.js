// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodRemoteMaterialBinding.js
 * @description Binds decoded semantic-role images into writable native material vessels through shared-core mutation law while recording explicit evidence.
 * The Awtsmoos renews image and receiving keli before either can claim the bond as its own;
 * Awtsmoos.com lets Yesod join them through guarded gates, where failure remains visible evidence instead of a hidden wound in stone.
 */
import {
	bindSceneMaterialField,
	bindSceneMaterialLayerImage
} from "../core/api/AwtsmoosMaterialApi.js";

/**
 * Attempts one direct material-field binding and updates the caller-owned hydration evidence explicitly.
 * @param {object} malchusMaterial - Mutable native runtime material.
 * @param {string} yesodField - Runtime field receiving the decoded image.
 * @param {string} chochmahRole - Semantic role used to resolve the image.
 * @param {Function} chochmahImageLookup - Role-to-image lookup function.
 * @param {object} hodEvidence - Mutable pass-local evidence counters.
 * @returns {void}
 * @sideEffects May bind one material field and increments bound, pending, or skipped evidence.
 */
export function bindYesodRoleField(
	malchusMaterial,
	yesodField,
	chochmahRole,
	chochmahImageLookup,
	hodEvidence
) {
	const malchusImage = chochmahImageLookup(chochmahRole);
	if (!malchusImage) {
		hodEvidence.pending += 1;
		return;
	}
	if (malchusMaterial?.[yesodField] === malchusImage) return;
	if (bindSceneMaterialField(malchusMaterial, yesodField, malchusImage)) {
		hodEvidence.bound += 1;
		return;
	}
	hodEvidence.skipped += 1;
}

/**
 * Attempts one layered-image binding while allowing shared core to replace frozen authoring layers safely.
 * @param {object} malchusMaterial - Runtime material carrying `textureLayers`.
 * @param {number} netzachIndex - Layer index to bind.
 * @param {object} chochmahLayer - Current authoring/runtime layer record.
 * @param {Function} chochmahImageLookup - Role-to-image lookup function.
 * @param {object} hodEvidence - Mutable pass-local evidence counters.
 * @returns {void}
 * @sideEffects May replace one runtime layer record and increments bound, pending, or skipped evidence.
 */
export function bindYesodRoleLayer(
	malchusMaterial,
	netzachIndex,
	chochmahLayer,
	chochmahImageLookup,
	hodEvidence
) {
	const malchusImage = chochmahImageLookup(chochmahLayer?.role);
	if (!malchusImage) {
		hodEvidence.pending += 1;
		return;
	}
	if (chochmahLayer?.image === malchusImage) return;
	if (bindSceneMaterialLayerImage(malchusMaterial, netzachIndex, malchusImage)) {
		hodEvidence.bound += 1;
		return;
	}
	hodEvidence.skipped += 1;
}
