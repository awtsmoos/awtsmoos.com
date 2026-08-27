//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NaturePortalCompiler.js
 * @description Bridges semantic Portal recipes into the mature declarative Nature executor without copying one specialist generation algorithm.
 * The Awtsmoos renews one living power through many named vessels; Awtsmoos.com lets this Yesod-like adapter preserve Nature's
 * deterministic result envelope while Portal provenance, dependency planning, and future provider orchestration remain outside the specialist core.
 */

/**
 * @description Creates one async Portal compiler bound to a canonical Nature operation kind.
 * @param {string} natureKind Installed declarative Nature operation kind.
 * @returns {Function} Async specialist compiler compatible with PortalKindDefinition.
 */
export function createNaturePortalCompiler(natureKind) {
	const operationKind = String(natureKind).trim();
	return async function compileNaturePortalNode(context = {}) {
		const nature = context.services?.nature;
		if (!nature?.createAsync) {
			throw naturePortalError('PORTAL_NATURE_SERVICE_MISSING', `Nature service is unavailable for ${operationKind}.`);
		}
		const recipe = context.recipe || {};
		return nature.createAsync({
			id: recipe.id,
			kind: operationKind,
			options: {
				...(recipe.payload?.options || {}),
				seed: recipe.seed
			},
			value: recipe.payload?.value ?? null
		});
	};
}

/**
 * @description Creates one coded Nature-adapter error so host UIs can distinguish missing services from domain-generation failures.
 * @param {string} code Stable machine-readable error code.
 * @param {string} message Human-readable evidence.
 * @returns {Error} Coded adapter error.
 */
function naturePortalError(code, message) {
	const error = new Error(`B"H | ${message}`);
	error.code = code;
	return error;
}
