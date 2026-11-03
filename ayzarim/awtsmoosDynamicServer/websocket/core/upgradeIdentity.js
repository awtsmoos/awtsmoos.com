// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const OAuth = require("./oauthUpgradeIdentity.js");

/**
 * @file Resolves verified account credentials before Awtsmoos.com upgrades a socket.
 * The Awtsmoos grants each principal its own shore;
 * a device is never impersonated by a client anymore.
 */
function sanitizeSocketIdentity(user) {
	const info = user?.info || {};
	const userId = text(info.userId || user?.userId || user?.id);
	const accountId = text(info.accountId || userId);
	if (!user?.authorized || !userId || !accountId) return null;
	return Object.freeze({
		accountId,
		userId,
		issuer: text(info.issuer || "awtsmoos"),
		subject: text(info.subject || info.sub || userId),
		sessionId: text(info.sessionId),
		permissionVersion: Number(info.permissionVersion || 1),
		revocationVersion: Number(info.revocationVersion || 1),
		assurance: "verified"
	});
}

/** Bearer upgrade never falls back to cookies after invalid bearer proof. */
function resolveUpgradeIdentity(server, request) {
	if (OAuth.isBearerUpgrade(request)) {
		return OAuth.resolveExternalIdentity(server, request);
	}
	if (typeof server.auth?.authenticateCookies !== "function" ||
		typeof server.parseCookies !== "function") return null;
	try {
		const cookies = typeof request.headers?.cookie === "string"
			? server.parseCookies(request.headers.cookie) : {};
		return sanitizeSocketIdentity(server.auth.authenticateCookies(cookies));
	} catch {
		return null;
	}
}

function text(value) {
	return String(value || "").trim().slice(0, 180);
}

module.exports = {
	resolveUpgradeIdentity,
	sanitizeSocketIdentity
};
