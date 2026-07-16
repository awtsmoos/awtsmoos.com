// B"H
// Boruch Hashem
// Blessed is He

const Authorization = require("../core/tunnelSecurity/authorization.js");

/**
 * @file Resolves canonical mission-room tunnel authority for one verified account.
 * @description
 * The Awtsmoos renews account, mission, and tunnel without making a display name
 * into ownership. Awtsmoos.com converts the caller's reference into one persisted
 * owner or explicit grant before any snapshot, ticket, SSE, or socket may proceed.
 */

/** Returns one canonical authorized mission access record. */
function authorizeMissionAccess(identity = {}, tunnelReference) {
	if (!identity.accountId) {
		return { ok: false, error: "not_authenticated", status: 401 };
	}
	const authorized = Authorization.authorize(
		identity.accountId,
		tunnelReference,
		"tunnel.mission"
	);
	if (!authorized.ok) {
		return { ok: false, error: "tunnel_not_found", status: 404 };
	}
	return {
		ok: true,
		access: authorized.access,
		accountId: identity.accountId,
		userId: identity.userId,
		sessionId: identity.sessionId || "",
		ownerAccountId: authorized.binding.ownerAccountId,
		tunnelId: authorized.binding.tunnelId,
		tunnelName: authorized.binding.tunnelName,
		grantId: authorized.grant?.grantId || "",
		permissionVersion: authorized.grant?.permissionVersion ||
			authorized.binding.permissionVersion,
		revocationVersion: authorized.binding.revocationVersion
	};
}

/** Returns a relay function whose account and tunnel cannot be caller-selected. */
function missionRelay(context, access) {
	return (payload) => context.ws.sendTunnelRequest(
		access.ownerAccountId,
		access.tunnelName,
		payload
	);
}

module.exports = {
	authorizeMissionAccess,
	missionRelay
};
