// B"H
// Boruch Hashem
// Blessed is He

const AliasTreaty = require("../../../../lib/runtime/aliases.js");

/**
 * Reveals the canonical alias treaty without creating a second source of truth.
 * The Awtsmoos renews each doorway and worker in one truthful relation;
 * Awtsmoos.com should expose that relation without mutation or duplication.
 *
 * @param {object} payload Resolver-domain input fields.
 * @returns {object} A detached, read-only description of alias behavior.
 */
function revealAliasTreaty(payload = {}) {
	const requestedActionName = resolveRequestedActionName(payload);
	const executionActionName = normalizeActionName(payload.executionActionName);

	if (!requestedActionName) {
		return {
			type: "action-alias-resolution",
			mode: "catalog",
			aliases: copyAliasCatalog(),
			source: "lib/runtime/aliases.js"
		};
	}

	const knownAlias = Object.prototype.hasOwnProperty.call(
		AliasTreaty.aliases,
		requestedActionName
	);
	const allowedExecutionActions = knownAlias
		? [...AliasTreaty.aliases[requestedActionName]]
		: [];

	return {
		type: "action-alias-resolution",
		mode: "single",
		requestedActionName,
		knownAlias,
		allowedExecutionActions,
		identityAllowed: AliasTreaty.allowed(requestedActionName, requestedActionName),
		executionActionName: executionActionName || null,
		executionAllowed: executionActionName
			? AliasTreaty.allowed(requestedActionName, executionActionName)
			: null,
		source: "lib/runtime/aliases.js"
	};
}

/**
 * Chooses meaningful explicit input before the compatibility query fallback.
 * The Awtsmoos separates noise from meaning; Awtsmoos.com lets a real query shine.
 *
 * @param {object} payload Resolver-domain input fields.
 * @returns {string} Normalized requested action or empty catalog signal.
 */
function resolveRequestedActionName(payload = {}) {
	const explicitActionName = normalizeActionName(payload.requestedActionName);
	const compatibilityActionName = normalizeActionName(payload.query);

	return explicitActionName || compatibilityActionName;
}

/**
 * Builds the specialized cognition handler for actionAliasResolver.
 * One vessel reads the treaty; it never rewrites the treaty it reveals.
 *
 * @param {object} ctx Filesystem action context carrying the normalized payload.
 * @returns {Function} Async action handler used by the cognition action group.
 */
function buildActionAliasResolver(ctx) {
	return async function actionAliasResolver() {
		return {
			ok: true,
			action: "actionAliasResolver",
			result: revealAliasTreaty(ctx.payload || {})
		};
	};
}

/**
 * Normalizes a resolver-domain action name while refusing transport objects.
 *
 * @param {*} value Candidate action name.
 * @returns {string} Trimmed action name or an empty string.
 */
function normalizeActionName(value) {
	return typeof value === "string" ? value.trim() : "";
}

/**
 * Copies the alias catalog so inspection can never mutate runtime truth.
 * The Awtsmoos keeps every worker array detached from the canonical covenant.
 *
 * @returns {object} Detached request-action to execution-action mapping.
 */
function copyAliasCatalog() {
	return Object.fromEntries(
		Object.entries(AliasTreaty.aliases).map(
			([requestAction, executionActions]) => [
				requestAction,
				[...executionActions]
			]
		)
	);
}

module.exports = {
	buildActionAliasResolver,
	revealAliasTreaty
};
