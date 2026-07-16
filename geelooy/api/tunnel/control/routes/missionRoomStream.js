// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const { json } = require("../core/respond.js");
const {
	authorizeMissionAccess,
	missionRelay
} = require("../missionRooms/missionAccess.js");
const {
	readMissionRoomSnapshot
} = require("../missionRooms/missionSnapshotService.js");
const {
	parseMissionRoomOptions
} = require("../missionRooms/requestOptions.js");
const {
	classify,
	scopedPayload,
	summarizeRoomOs
} = require("../missionRooms/roomSummary.js");
const {
	startMissionRoomStream
} = require("../missionRooms/streamSession.js");
const {
	issueMissionRoomTicket
} = require("../missionRooms/ticketIssuer.js");

/**
 * @file Serves mission-room ticket, snapshot, and SSE modes through one authority.
 * @description
 * The Awtsmoos renews route, account, mission, and transport together.
 * Awtsmoos.com resolves the canonical authorized tunnel once, then hands the same
 * immutable relay vessel to snapshot and EventSource flows without query widening.
 */

async function missionRoomStream(context) {
	const identity = currentIdentity(context);
	if (!identity.ok) {
		return json(context, packet(false, "not_authenticated"), 401);
	}
	const options = parseMissionRoomOptions(context);
	if (!options.missionId) {
		return json(context, packet(false, "missing_missionId"), 400);
	}
	if (options.mode === "socket-ticket") {
		const issued = await issueMissionRoomTicket(context, identity, options);
		return json(context, issued.body, issued.status);
	}
	const access = authorizeMissionAccess(identity, options.tunnelName);
	if (!access.ok) {
		return json(context, packet(false, access.error), access.status);
	}
	const canonical = { ...options, ...access, roomId: options.missionId };
	const sendAuthorized = missionRelay(context, access);
	const response = context.response || context.res;
	if (!response?.write) {
		return json(context, await readMissionRoomSnapshot(
			sendAuthorized,
			canonical
		));
	}
	return startMissionRoomStream(context, canonical, sendAuthorized);
}

function packet(ok, error) {
	return { BH: "B\"H", ok, error };
}

module.exports = {
	classify,
	missionRoomStream,
	scopedPayload,
	summarizeRoomOs
};
