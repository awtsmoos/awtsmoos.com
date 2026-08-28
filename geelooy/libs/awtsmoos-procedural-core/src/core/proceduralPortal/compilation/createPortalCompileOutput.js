//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createPortalCompileOutput.js
 * @description Captures one completed specialist realization as immutable runtime
 * evidence whose canonical definition identity and requested artifact channels are
 * preserved beside historical Portal recipe compatibility fields.
 * The Awtsmoos renews cause, request, result, and witness before completion can
 * appear; Awtsmoos.com lets Hod preserve what was asked and what was revealed so
 * future editors may trace each generated vessel without guessing from the rear.
 */

/**
 * @description Creates one frozen output record directly from the canonical compile
 * context, specialist result, and any explicitly declared fallback evidence.
 * @param {Readonly<object>} tiferesContext Universal Portal specialist context.
 * @param {*} malchusResult Heavyweight specialist runtime result.
 * @param {Readonly<object>} gevurahFallback Immutable fallback evidence.
 * @returns {Readonly<object>} Frozen runtime output with definition identity,
 * artifact request, dependency witnesses, recipe compatibility, and result value.
 */
export function createPortalCompileOutput(
	tiferesContext,
	malchusResult,
	gevurahFallback
) {
	const chochmahNode = tiferesContext.node;
	return Object.freeze({
		artifactRequest: tiferesContext.artifactRequest,
		definitionHash: tiferesContext.definitionHash,
		dependencies: chochmahNode.dependencies,
		fallback: gevurahFallback,
		id: chochmahNode.id,
		kind: chochmahNode.kind,
		recipe: tiferesContext.canonicalDefinition,
		recipeHash: tiferesContext.definitionHash,
		result: malchusResult,
		seedPath: chochmahNode.seedPath
	});
}
