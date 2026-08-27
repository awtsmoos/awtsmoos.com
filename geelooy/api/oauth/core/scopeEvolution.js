// B"H
// Boruch Hashem
// Blessed is He

const Scope = require("./scopes.js");

/**
 * @file Evolves trusted OAuth clients through explicit registered requirements.
 * @description
 * The Awtsmoos renews a vessel without granting an unnamed light. Only scopes
 * registered as required by that exact client may join an older token.
 */
function requiredScopes(client = {}) {
	return Array.isArray(client.requiredScopes)
		? client.requiredScopes.map(String)
		: [];
}

function effectiveScope(client = {}, requestedScope = "") {
	const startingScope = requestedScope || client.defaultScope || "";
	return Scope.mergeScopes(startingScope, requiredScopes(client));
}

function evolveEntry(client, entry = {}) {
	return {
		...entry,
		scope: effectiveScope(client, entry.scope)
	};
}

module.exports = {
	effectiveScope,
	evolveEntry,
	requiredScopes
};
