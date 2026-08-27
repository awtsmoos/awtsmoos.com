// B"H
// Boruch Hashem
// Blessed is He

const { readBearer } = require("../../../oauth/core/tokenReader.js");
const { verifyApiKey } = require("./apiKeyStore.js");
const Id = require("./tunnelSecurity/identifiers.js");

/**
 * @file Resolves authoritative Tunnel Control account identity server-side.
 * @description
 * The Awtsmoos gives every session its living instant, while Awtsmoos.com refuses
 * browser-supplied owner fields. Account identity comes only from a verified
 * session, OAuth token record, or server-verified API key.
 */

/** Returns normalized query parameters without granting them authority. */
function query($i) {
	return $i.paramKinds?.GET || $i.$_GET || $i.request?.query || {};
}

/** Builds one immutable identity record from trusted server values. */
function identityRecord(input = {}) {
	const accountId = Id.accountId(input.accountId || input.userId);
	if (!accountId) {
		return null;
	}
	return Object.freeze({
		ok: true,
		kind: String(input.kind || "unknown"),
		accountId,
		userId: String(input.userId || accountId),
		issuer: String(input.issuer || "awtsmoos"),
		subject: String(input.subject || input.userId || accountId),
		clientId: String(input.clientId || ""),
		sessionId: String(input.sessionId || ""),
		expiresAt: Number(input.expiresAt || 0) || null,
		authenticatedAt: Number(input.authenticatedAt || 0) || null,
		permissionVersion: Number(input.permissionVersion || 1),
		revocationVersion: Number(input.revocationVersion || 1),
		scopes: Array.isArray(input.scopes) ? [...input.scopes] : []
	});
}

/** Resolves a signed browser session identity. */
function sessionIdentity($i) {
	const user = $i.request.user;
	const info = user?.info || {};
	const userId = info.userId || user?.userId || user?.id || null;
	return identityRecord({
		kind: "session",
		userId,
		accountId: info.accountId || userId,
		issuer: info.issuer,
		subject: info.subject || info.sub || userId,
		sessionId: info.sessionId,
		expiresAt: info.expiresAt,
		authenticatedAt: info.authenticatedAt,
		permissionVersion: info.permissionVersion,
		revocationVersion: info.revocationVersion,
		scopes: ["tunnel.read", "tunnel.write", "tunnel.admin"]
	});
}

/** Resolves a validated OAuth bearer record. */
function oauthIdentity($i) {
	const authorization = $i.request.headers.authorization || "";
	if (!/^Bearer\s+/i.test(authorization)) {
		return null;
	}
	const resolved = readBearer($i);
	if (!resolved.ok) {
		return null;
	}
	const entry = resolved.entry;
	return identityRecord({
		kind: "oauth",
		userId: entry.userId,
		accountId: entry.accountId || entry.userId,
		issuer: entry.issuer,
		subject: entry.subject || entry.userId,
		clientId: entry.clientId,
		expiresAt: entry.expiresAt,
		scopes: String(entry.scope || "").split(/\s+/).filter(Boolean)
	});
}

/** Resolves a server-verified API key identity. */
function apiKeyIdentity($i) {
	const parameters = query($i);
	const key = parameters.apiKey ||
		parameters.api_key ||
		$i.request.headers["x-awtsmoos-api-key"] ||
		String($i.request.headers.authorization || "")
			.replace(/^AwtsmoosKey\s+/i, "");
	if (!key) {
		return null;
	}
	const resolved = verifyApiKey(key);
	if (!resolved.ok) {
		return null;
	}
	return identityRecord({
		kind: "apiKey",
		userId: resolved.key.userId,
		accountId: resolved.key.accountId || resolved.key.userId,
		clientId: resolved.key.keyId,
		scopes: resolved.key.scopes || []
	});
}

/** Returns the first authoritative identity source. */
function currentIdentity($i) {
	return oauthIdentity($i) ||
		apiKeyIdentity($i) ||
		sessionIdentity($i) ||
		{ ok: false, error: "not_authenticated" };
}

module.exports = {
	currentIdentity,
	identityRecord,
	requireIdentity: currentIdentity
};
