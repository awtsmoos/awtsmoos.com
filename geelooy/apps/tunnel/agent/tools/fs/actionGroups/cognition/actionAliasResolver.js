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
	const requestedActionName = normalizeActionName(
		payload.requestedActionName || payload.query
	);
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
 *
 * @returns {object} Detached request-action to execution-action mapping.
 */
function copyAliasCatalog() {
	const catalog = {};

	for (const [requestAction, executionActions] of Object.entries(AliasTreaty.aliases)) {
		catalog[requestAction] = [...executionActions];
	}

	return catalog;
}

module.exports = {
	buildActionAliasResolver,
	revealAliasTreaty
};
