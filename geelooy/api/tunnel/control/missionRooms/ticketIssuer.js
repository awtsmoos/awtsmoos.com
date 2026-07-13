//B"H
//Boruch Hashem
//Blessed is He

const { ROOM_PROTOCOL_VERSION } = require("./requestOptions.js");
const {
	readMissionRoomSnapshot
} = require("./missionSnapshotService.js");
const { issueTicket } = require("./ticketStore.js");

/**
 * B"H
 *
 * Permission must follow witnessed reality. The Awtsmoos creates mission and
 * credential together; Awtsmoos.com issues no socket ticket until the selected
 * tunnel has actually returned a reachable mission snapshot.
 */

/** Preflights a mission and issues one origin-bound socket ticket. */
async function issueMissionRoomTicket(context, identity, options) {
	const validation = validate(identity, options);
	if (!validation.ok) {
		return validation;
	}

	const send = (tunnelName, payload) => (
		context.ws.sendTunnelRequest(tunnelName, payload)
	);
	const initialSnapshot = await readMissionRoomSnapshot(send, options);

	if (!initialSnapshot.ok) {
		return result(502, initialSnapshot);
	}

	const issued = issueTicket({
		userId: identity.userId,
		identityKind: identity.kind || "session",
		tunnelName: options.tunnelName,
		missionId: options.missionId,
		origin: options.origin,
		protocolVersion: options.protocolVersion,
		lastSequence: options.lastSequence,
		resumeToken: options.resumeToken,
		pollMs: options.pollMs,
		historyLimit: options.historyLimit,
		conversationId: options.conversationId,
		conversationName: options.conversationName,
		agentSessionId: options.agentSessionId,
		logicalAgentId: options.logicalAgentId,
		clientRequestId: options.clientRequestId,
		initialSnapshot
	});

	return result(200, {
		BH: "B\"H",
		ok: true,
		ticket: issued.token,
		expiresAt: issued.expiresAt,
		protocolVersion: ROOM_PROTOCOL_VERSION,
		missionId: options.missionId,
		tunnelName: options.tunnelName
	});
}

function validate(identity = {}, options = {}) {
	if (!identity.userId) {
		return result(401, packet("not_authenticated"));
	}
	if (!hasReadScope(identity)) {
		return result(403, packet("missing_tunnel_read_scope"));
	}
	if (!options.missionId) {
		return result(400, packet("missing_missionId"));
	}
	if (!options.origin) {
		return result(400, packet("missing_request_origin"));
	}
	if (options.protocolVersion !== ROOM_PROTOCOL_VERSION) {
		return result(409, packet("mission_room_protocol_version_mismatch", {
			supportedProtocolVersion: ROOM_PROTOCOL_VERSION
		}));
	}
	return { ok: true };
}

function hasReadScope(identity) {
	const scopes = new Set(identity.scopes || []);
	return identity.kind === "session"
		|| scopes.has("tunnel.read")
		|| scopes.has("tunnel.admin")
		|| scopes.has("tunnel.control");
}

function packet(error, extra = {}) {
	return {
		BH: "B\"H",
		ok: false,
		error,
		...extra
	};
}

function result(status, body) {
	return {
		ok: status < 400,
		status,
		body
	};
}

module.exports = {
	issueMissionRoomTicket
};