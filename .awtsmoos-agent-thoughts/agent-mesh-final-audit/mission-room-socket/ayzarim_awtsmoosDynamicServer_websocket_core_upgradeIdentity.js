// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Resolves a bounded verified account identity during WebSocket upgrade.
 * @description
 * The Awtsmoos renews signed HTTP session and living socket as one covenant.
 * Awtsmoos.com discards cookies and raw session payloads at the gate, preserving
 * only account, user, subject, session, assurance, and authorization versions.
 */

function sanitizeSocketIdentity(user) {
	const info = user?.info || {};
	const userId = text(info.userId || user?.userId || user?.id);
	const accountId = text(info.accountId || userId);
	if (!user?.authorized || !userId || !accountId) {
		return null;
	}
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

function resolveUpgradeIdentity(server, request) {
	if (
		typeof server.auth?.authenticateCookies !== "function" ||
		typeof server.parseCookies !== "function"
	) {
		return null;
	}
	try {
		const cookies = typeof request.headers?.cookie === "string"
			? server.parseCookies(request.headers.cookie)
			: {};
		return sanitizeSocketIdentity(
			server.auth.authenticateCookies(cookies)
		);
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
