//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalDependencyFactory.js
 * @description Guards semantic dependency expansion so high-level kinds may reveal child recipes without smuggling asynchronous work into planning.
 * The Awtsmoos renews every cause before manifestation can demand its consequence; Awtsmoos.com lets this Binah-like boundary keep
 * dependency factories synchronous, array-shaped, coded on failure, and therefore safe for deterministic dry-run plans before expensive work begins.
 */

/**
 * @description Invokes one optional synchronous dependency factory and validates that it returns only a recipe collection for later canonicalization.
 * @param {object} definition Installed semantic kind definition carrying an optional dependencyFactory.
 * @param {Readonly<object>} recipe Canonical parent recipe whose semantic intent may reveal child requirements.
 * @returns {Array<object|string>} Dependency recipe intents to normalize beneath the parent seed lineage.
 */
export function revealPortalDependencies(definition, recipe) {
	if (!definition.dependencyFactory) {
		return [];
	}
	const result = definition.dependencyFactory(recipe);
	if (result?.then) {
		throw createPortalExpansionError(
			'PORTAL_ASYNC_DEPENDENCY_FACTORY',
			`${definition.kind} dependencyFactory must remain synchronous.`
		);
	}
	if (!Array.isArray(result)) {
		throw createPortalExpansionError(
			'PORTAL_DEPENDENCY_FACTORY_INVALID',
			`${definition.kind} dependencyFactory must return an array.`
		);
	}
	return result;
}

/**
 * @description Creates one stable coded dependency-expansion error for planners, generated editors, logs, and focused tests.
 * @param {string} code Machine-readable expansion failure code.
 * @param {string} message Human-readable evidence describing the invalid dependency state.
 * @returns {Error} Error carrying the stable `code` property.
 */
export function createPortalExpansionError(code, message) {
	const error = new Error(`B"H | ${message}`);
	error.code = code;
	return error;
}
