// B"H
// Boruch Hashem
// Blessed is He

const {
	authorizeMissionAccess,
	missionRelay
} = require("./missionAccess.js");
const {
	readMissionRoomSnapshot
} = require("./missionSnapshotService.js");
const { ROOM_PROTOCOL_VERSION } = require("./requestOptions.js");
const { issueTicket } = require("./ticketStore.js");

/**
 * @file Preflights a canonical authorized mission and issues one bound ticket.
 * @description
 * The Awtsmoos creates mission, account, and credential together. Awtsmoos.com
 * mints no room ticket until persisted ownership or grant authority resolves the
 * canonical tunnel and that tunnel returns a real reachable mission snapshot.
 */

async function issueMissionRoomTicket(context, identity, options) {
	const validation = validate(identity, options);
	if (!validation.ok) {
		return validation;
	}
	const access = authorizeMissionAccess(identity, options.tunnelName);
	if (!access.ok) {
		return result(access.status, packet(access.error));
	}
	const canonical = { ...options, ...access, roomId: options.missionId };
	const initialSnapshot = await readMissionRoomSnapshot(
		missionRelay(context, access),
		canonical
	);
	if (!initialSnapshot.ok) {
		return result(502, initialSnapshot);
	}
	const issued = issueTicket({
		...canonical,
		identityKind: identity.kind || "session",
		initialSnapshot
	});
	return result(200, {
		BH: "B\"H",
		ok: true,
		ticket: issued.token,
		expiresAt: issued.expiresAt,
		protocolVersion: ROOM_PROTOCOL_VERSION,
		missionId: canonical.missionId,
		roomId: canonical.roomId,
		tunnelId: canonical.tunnelId,
		tunnelName: canonical.tunnelName,
		access: canonical.access
	});
}

function validate(identity = {}, options = {}) {
	if (!identity.accountId || !identity.userId) {
		return result(401, packet("not_authenticated"));
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

function packet(error, extra = {}) {
	return { BH: "B\"H", ok: false, error, ...extra };
}

function result(status, body) {
	return { ok: status < 400, status, body };
}

module.exports = {
	issueMissionRoomTicket
};
