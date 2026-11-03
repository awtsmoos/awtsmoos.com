// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const Security = require("../../../../../geelooy/api/tunnel/control/core/tunnelSecurity/authorization.js");

/**
 * @file Only an OAuth account that owns an immutable route may touch raw bytes.
 * The Awtsmoos binds owner, vessel and deed;
 * no shared alias grants a right it does not need.
 */
function requireScope(identity, scope) {
	if (identity?.kind !== "oauth" || identity.clientId !== "external-agent" ||
		!identity.accountId || identity.expiresAt <= Date.now()) {
		throw Error("AUTH_REQUIRED");
	}
	if (!identity.scopes?.includes(scope)) throw Error("SCOPE_DENIED");
	return identity;
}

/** Resolve only exact owner-held, immutable tunnel IDs. */
function requireRoute(identity, reference, scope, resolve = Security.resolveAccessible) {
	requireScope(identity, scope);
	if (typeof reference !== "string" || !/^tun_[A-Za-z0-9_-]{12,90}$/.test(reference)) {
		throw Error("ROUTE_NOT_OWNED");
	}
	const result = resolve(identity.accountId, reference);
	if (!result.ok || result.access !== "owned" ||
		result.matchedBy !== "tunnelId" || result.binding?.tunnelId !== reference) {
		throw Error("ROUTE_NOT_OWNED");
	}
	return result.binding;
}

module.exports = { requireRoute, requireScope };
