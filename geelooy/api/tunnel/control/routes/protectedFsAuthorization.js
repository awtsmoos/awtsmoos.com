// B"H
// Boruch Hashem
// Blessed is He

const { scopeAllowed } = require("../core/apiKeyStore.js");

/**
 * @file Separates authenticated identity from elevated mutation authority.
 * @description
 * The Awtsmoos renews login and permission without confusing their vessels.
 * Awtsmoos.com tells a signed-in browser that its session remains valid while a
 * scoped API key is required for mutation; it never falsely demands OAuth again.
 */
function coarseDenial(identity, action, permission, sessionMayUse) {
	if (identity.kind === "session" && !sessionMayUse(action)) {
		return result(403, {
			error: "api_key_required",
			action,
			neededScope: permission,
			authenticated: true,
			identityKind: "session",
			credentialKind: "apiKey",
			message: mutationMessage(action, permission)
		});
	}
	if (identity.kind !== "session" &&
		!scopeAllowed(identity, permission) &&
		!scopeAllowed(identity, "tunnel.admin")) {
		return result(403, {
			error: "missing_scope",
			action,
			neededScope: permission,
			authenticated: true,
			identityKind: identity.kind,
			message: `Authenticated credential lacks ${permission}.`
		});
	}
	return null;
}

function unauthorized(identity = {}) {
	return failure(identity.error || "not_authenticated", {
		authenticated: false,
		message: "Sign in to Awtsmoos before using Tunnel Control."
	});
}

function failure(error, details = {}) {
	return {
		BH: "B\"H",
		ok: false,
		error,
		action: details.action || "",
		neededScope: details.neededScope || "",
		authenticated: details.authenticated === true,
		identityKind: details.identityKind || "",
		credentialKind: details.credentialKind || "",
		message: details.message || ""
	};
}

function result(status, details) {
	return {
		status,
		body: failure(details.error, details)
	};
}

function mutationMessage(action, permission) {
	return `You are signed in. Select an API key with ${permission} to run ${action}.`;
}

module.exports = {
	coarseDenial,
	failure,
	mutationMessage,
	unauthorized
};
