// B"H
// Boruch Hashem
// Blessed is He

const Authorization = require(
	"../../../../../geelooy/api/tunnel/control/core/tunnelSecurity/authorization.js"
);
const {
	canonicalOrigin,
	ROOM_PROTOCOL_VERSION
} = require(
	"../../../../../geelooy/api/tunnel/control/missionRooms/requestOptions.js"
);
const {
	consumeTicket
} = require(
	"../../../../../geelooy/api/tunnel/control/missionRooms/ticketStore.js"
);
const Claims = require("./upgradeClaims.js");
const Response = require("./upgradeResponse.js");

/**
* @file Authorizes mission-room WebSocket upgrades against current account access.
* @description
* The Awtsmoos renews ticket, session, grant, and gate in one instant.
* Awtsmoos.com consumes each token once, binds it to verified socket identity,
* and rechecks current mission permission and revocation before the handshake.
*/

const MISSION_ROOM_PATH = "/api/tunnel/control/mission-room/ws";

function authorizeMissionRoomUpgrade(request = {}, identity = null) {
	const url = Claims.requestUrl(request.url);
	if (url.pathname !== MISSION_ROOM_PATH) {
		return { handled: false };
	}
	if (!request.headers?.["sec-websocket-key"]) {
		return Response.denial(400, "missing_websocket_key");
	}
	if (!identity?.accountId) {
		return Response.denial(401, "mission_room_authentication_required");
	}
	const origin = canonicalOrigin(request.headers?.origin);
	if (!origin) {
		return Response.denial(403, "missing_websocket_origin");
	}
	const claims = Claims.claimsFrom(url, origin, identity);
	const consumed = consumeTicket(url.searchParams.get("ticket"), claims);
	if (!consumed.ok) {
		return Response.denial(
			Response.statusFor(consumed.error),
			consumed.error
		);
	}
	const current = Authorization.authorize(
		identity.accountId,
		consumed.ticket.tunnelId,
		"tunnel.mission"
	);
	if (!current.ok || !Claims.sameAuthority(consumed.ticket, current)) {
		return Response.denial(403, "mission_room_permission_changed");
	}
	if (claims.protocolVersion !== ROOM_PROTOCOL_VERSION) {
		return Response.denial(
			409,
			"mission_room_protocol_version_mismatch"
		);
	}
	return {
		handled: true,
		ok: true,
		ticket: consumed.ticket
	};
}

module.exports = {
	MISSION_ROOM_PATH,
	authorizeMissionRoomUpgrade,
	rejectMissionRoomUpgrade: Response.rejectMissionRoomUpgrade
};
