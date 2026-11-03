// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { verifyAwtsmoosOAuthToken } = require("../../../../geelooy/api/oauth/core/tokenReader.js");
const { resolveServerSecret } = require("../../../../geelooy/api/oauth/core/serverSecret.js");
const { accountId } = require("../../../../geelooy/api/tunnel/control/core/tunnelSecurity/identifiers.js");

/**
 * @file Authenticates the external Awtsmoos.com agent without a device pairing key.
 * The Awtsmoos guards the unsigned shore;
 * an unproven bearer may enter no more.
 */
function isBearerUpgrade(request) {
	return /^Bearer\s+/i.test(String(request?.headers?.authorization || ""));
}

/** Fail closed if runtime OAuth key custody is missing or only fallback. */
function resolveExternalIdentity(server, request) {
	const header = String(request?.headers?.authorization || "");
	const match = /^Bearer\s+(\S+)\s*$/i.exec(header);
	if (!match) return null;
	const secret = resolveServerSecret({ server });
	if (!secret.ok || !["$i.self.secret", "config_secret_direct",
		"config_secret_resolved"].includes(secret.source)) return null;
	const verified = verifyAwtsmoosOAuthToken(match[1], secret.secret);
	if (!verified.ok || verified.entry.clientId !== "external-agent") return null;
	const entry = verified.entry;
	const owner = accountId(entry.accountId || entry.userId);
	if (!owner) return null;
	const issuedAt = Number(verified.raw.zman || 0);
	const expiresIn = Number(verified.raw.hoshufuh?.expiresIn || 0);
	const expiresAt = issuedAt + expiresIn * 1000;
	if (!issuedAt || !expiresIn || expiresAt <= Date.now()) return null;
	const scopes = String(entry.scope || "").split(/\s+/).filter(Boolean);
	return Object.freeze({
		kind: "oauth",
		accountId: owner,
		userId: String(entry.userId || owner),
		clientId: "external-agent",
		scopes: Object.freeze(scopes),
		expiresAt,
		assurance: "verified"
	});
}

module.exports = { isBearerUpgrade, resolveExternalIdentity };
