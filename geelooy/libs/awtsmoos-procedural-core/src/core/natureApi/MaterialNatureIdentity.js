//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MaterialNatureIdentity.js
 * @description Joins existing local, remote, generated, and logical-stack identities into transparent aggregate diagnostics without replacing any subsystem cache contract.
 * The Awtsmoos renews every garment before local key, remote variant, generated request, or layered recipe can seem independent;
 * Awtsmoos.com lets Tiferes gather those finite signs into one readable identity while every older Yesod key remains exactly as intended.
 */

import { createMaterialStableIdentity } from '../materials/MaterialStableIdentity.js';

/**
 * Creates aggregate surface identity from identities already authored by the local, remote, generated, and pairing authorities.
 * @param {Readonly<object>} malchusSurface Resolved local surface plan value.
 * @returns {Readonly<object>} Frozen aggregate identity preserving every underlying key verbatim.
 */
export function createNatureMaterialIdentity(malchusSurface) {
	const tiferesEvidence = {
		family: String(malchusSurface?.family || 'generic'),
		fallbackKey: malchusSurface?.pairing?.fallbackKey ?? null,
		generatedKey: malchusSurface?.generation?.cacheKey ?? null,
		remoteRequestKey: malchusSurface?.remote?.requestKey ?? null,
		remoteVariantKey: malchusSurface?.remote?.variantKey ?? null,
		resolutionOrder: malchusSurface?.pairing?.resolutionOrder ?? ['local'],
		role: String(malchusSurface?.role || 'surface')
	};
	const yesodIdentity = createMaterialStableIdentity('surface', tiferesEvidence);
	return Object.freeze({
		...tiferesEvidence,
		key: yesodIdentity.key
	});
}

/**
 * Creates stable logical recipe identity without renderer page/capacity diagnostics or transient runtime state.
 * @param {Readonly<object>} tiferesRecipe MaterialStackRecipe instance or equivalent immutable logical recipe.
 * @returns {Readonly<object>} Frozen logical recipe identity and canonical evidence.
 */
export function createNatureMaterialRecipeIdentity(tiferesRecipe) {
	if (!tiferesRecipe || typeof tiferesRecipe !== 'object') {
		throw new TypeError('B"H | Material recipe identity requires a logical recipe object.');
	}
	const malchusEvidence = {
		fallbackColor: tiferesRecipe.fallbackColor,
		layers: tiferesRecipe.layers,
		name: String(tiferesRecipe.name || 'material-stack'),
		shader: String(tiferesRecipe.shader || 'material-stack'),
		targetActiveLayers: Number(tiferesRecipe.targetActiveLayers || 1)
	};
	const yesodIdentity = createMaterialStableIdentity('stack', malchusEvidence);
	return Object.freeze({
		evidence: yesodIdentity.evidence,
		key: yesodIdentity.key,
		name: malchusEvidence.name
	});
}
