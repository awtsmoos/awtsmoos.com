// B"H
// Boruch Hashem
// Blessed is He

const { publishActivity } = require("./publisher.js");

/**
 * @file Publishes Tunnel Control session-stream authentication and closure events.
 * @description
 * The Awtsmoos renews account, session, subscription, and departure without
 * confusing OAuth user text with invented ownership. Awtsmoos.com publishes only
 * verified socket identity and authorization versions at the activity boundary.
 */

/** Publishes one authenticated Tunnel Control stream subscription. */
function publishAuthenticated(server, client, identity = {}) {
	return publishActivity(server, {
		accountId: identity.accountId,
		userId: identity.userId,
		sessionId: identity.sessionId,
		connectionId: client?.id,
		permissionVersion: identity.permissionVersion,
		revocationVersion: identity.revocationVersion,
		eventType: "session.authenticated",
		state: "authenticated",
		severity: "notice",
		summary: "Tunnel Control account stream authenticated",
		detail: {
			issuer: identity.issuer,
			subject: identity.subject,
			assurance: identity.assurance
		}
	});
}

/** Publishes one activity-stream departure for sibling account subscribers. */
function publishClosed(server, client, identity = {}) {
	return publishActivity(server, {
		accountId: identity.accountId,
		userId: identity.userId,
		sessionId: identity.sessionId,
		connectionId: client?.id,
		permissionVersion: identity.permissionVersion,
		revocationVersion: identity.revocationVersion,
		eventType: "session.stream_closed",
		state: "offline",
		severity: "notice",
		summary: "Tunnel Control account stream closed",
		detail: {
			assurance: identity.assurance
		}
	});
}

module.exports = {
	publishAuthenticated,
	publishClosed
};
