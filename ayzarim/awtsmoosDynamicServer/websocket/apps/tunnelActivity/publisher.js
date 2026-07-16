// B"H
// Boruch Hashem
// Blessed is He

const { getActivityHub } = require("./hubAccess.js");

/**
 * @file Offers narrow publishers for connection, action, and room lifecycles.
 * @description
 * The Awtsmoos renews every deed before it is named. Awtsmoos.com lets runtime
 * modules publish only bounded facts through one gate, keeping transport details
 * and subscriber mechanics outside the connection, relay, and mission vessels.
 */

/** Publishes one account-bound activity record without throwing into its caller. */
function publishActivity(server, input = {}) {
	try {
		return getActivityHub(server).publish(input);
	} catch {
		return null;
	}
}

/** Builds common identity fields from an authenticated client. */
function clientFields(client = {}) {
	const identity = client.identity || {};
	return {
		accountId: client.accountId || identity.accountId || identity.userId,
		userId: identity.userId,
		sessionId: identity.sessionId,
		connectionId: client.id,
		deviceId: client.deviceId,
		tunnelId: client.tunnelId,
		tunnelName: client.tunnelName,
		permissionVersion: client.permissionVersion || identity.permissionVersion,
		revocationVersion: client.revocationVersion || identity.revocationVersion
	};
}

/** Publishes a connection lifecycle event from a server-owned socket client. */
function publishConnection(server, client, eventType, detail = {}) {
	return publishActivity(server, {
		...clientFields(client),
		eventType,
		state: detail.state || eventType.split(".").pop(),
		severity: detail.severity,
		summary: detail.summary || `${client.tunnelName || client.id || "Connection"} ${eventType}`,
		detail
	});
}

/** Publishes one relay action transition with preserved correlation identifiers. */
function publishAction(server, context = {}, eventType, detail = {}) {
	return publishActivity(server, {
		accountId: context.accountId,
		userId: context.userId,
		connectionId: context.connectionId,
		deviceId: context.deviceId,
		tunnelId: context.tunnelId,
		tunnelName: context.tunnelName,
		agentId: context.agentId,
		actionId: context.actionId,
		requestId: context.requestId,
		correlationId: context.correlationId,
		eventType,
		state: detail.state || eventType.split(".").pop(),
		severity: detail.severity,
		summary: detail.summary || `${context.action || "Action"} ${eventType}`,
		detail: {
			action: context.action,
			...detail
		}
	});
}

/** Publishes one mission-room transition from an authorized ticket. */
function publishRoom(server, ticket = {}, eventType, detail = {}) {
	return publishActivity(server, {
		accountId: ticket.accountId,
		userId: ticket.userId,
		sessionId: ticket.sessionId,
		tunnelId: ticket.tunnelId,
		tunnelName: ticket.tunnelName,
		missionId: ticket.missionId,
		roomId: ticket.roomId || ticket.missionId,
		agentId: ticket.logicalAgentId,
		eventType,
		state: detail.state || eventType.split(".").pop(),
		severity: detail.severity,
		summary: detail.summary || `${ticket.missionId || "Mission room"} ${eventType}`,
		detail
	});
}

module.exports = {
	clientFields,
	publishAction,
	publishActivity,
	publishConnection,
	publishRoom
};
