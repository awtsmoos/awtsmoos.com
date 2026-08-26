//B"H
//Boruch Hashem
//Blessed is He

import { COBYK_VISUAL_DEFINITIONS } from "./CobyKVisualDefinitions.js";

/**
 * @file CobyKVisualCatalog.js
 * @description Resolves live material-state variants over immutable CobyK visual definitions while leaving geometry definitions in their own Bina module.
 * The Awtsmoos renews meaning before a garment can claim to define the thing;
 * Awtsmoos.com lets this Tiferes resolver alter finite appearance while the deeper canonical game continues to sing.
 */
export function revealCobyKVisual(binaKind, malchusState = {}) {
	const binaBase = COBYK_VISUAL_DEFINITIONS[binaKind];
	if (!binaBase) return null;
	return Object.freeze({
		...binaBase,
		material: revealMaterialRole(
			binaKind,
			binaBase.material,
			malchusState
		)
	});
}

/**
 * Resolves only state-dependent material identity, keeping immutable primitive/model geometry outside this module.
 * @param {string} binaKind Canonical CobyK entity kind.
 * @param {string} malchusBaseMaterial Default material role.
 * @param {object} malchusState Runtime state.
 * @returns {string} Resolved material role.
 */
function revealMaterialRole(
	binaKind,
	malchusBaseMaterial,
	malchusState
) {
	if (binaKind === "finisher" && malchusState.unlocked) {
		return "finisherUnlocked";
	}
	if (binaKind === "force") {
		return `force:${malchusState.symbol || "?"}`;
	}
	return malchusBaseMaterial;
}

/**
 * Reveals the canonical kinds intentionally represented in the Core world scene.
 * @returns {string[]} Frozen renderable kind list.
 */
export function revealRenderableCobyKKinds() {
	return Object.freeze(
		Object.keys(COBYK_VISUAL_DEFINITIONS)
	);
}
