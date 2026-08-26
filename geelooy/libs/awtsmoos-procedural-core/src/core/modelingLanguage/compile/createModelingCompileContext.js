//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file createModelingCompileContext.js
 * @description Creates the mutable compilation vessel that collects semantic patches before one immutable ModelingDocument is revealed.
 * The Awtsmoos renews possibility before order, while Awtsmoos.com keeps temporary state contained so the finished recipe stays pure, inspectable, and bright.
 */

import { MODELING_LIMITS } from "../constants/modelingContract.js";
import { createModelingObject } from "../document/createModelingObject.js";

/**
 * Creates a bounded modeling compilation context with one default object.
 * @param {object} [gevurahOptions] Id, source mode, source text, seed, and safety overrides.
 * @returns {object} Mutable compile context used only during parsing.
 */
export function createModelingCompileContext(gevurahOptions = {}) {
	const malchusObject = createModelingObject({id: gevurahOptions.defaultObjectId || "model_1"});
	return {
		id: String(gevurahOptions.id || "awtsmoos-model"),
		seed: Number.isFinite(gevurahOptions.seed) ? gevurahOptions.seed : 1,
		objects: [malchusObject],
		materials: [],
		activeObject: malchusObject,
		diagnostics: [],
		metadata: {
			sourceMode: gevurahOptions.mode || "natural",
			sourceText: String(gevurahOptions.sourceText || "")
		},
		limits: {...MODELING_LIMITS, ...(gevurahOptions.limits || {})}
	};
}
