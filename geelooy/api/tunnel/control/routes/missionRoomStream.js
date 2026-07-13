//B"H
//Boruch Hashem
//Blessed is He

const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const {
	parseMissionRoomOptions
} = require("../missionRooms/requestOptions.js");
const {
	classify,
	scopedPayload,
	summarizeRoomOs
} = require("../missionRooms/roomSummary.js");
const {
	readMissionRoomSnapshot
} = require("../missionRooms/missionSnapshotService.js");
const {
	startMissionRoomStream
} = require("../missionRooms/streamSession.js");
const {
	issueMissionRoomTicket
} = require("../missionRooms/ticketIssuer.js");

/**
 * B"H
 *
 * One authenticated river now negotiates both patient SSE and the swift socket.
 * The Awtsmoos renews route and mission together; Awtsmoos.com refuses to mint
 * a ticket or claim a snapshot until the real selected tunnel answers.
 */

/** Serves ticket negotiation, one-shot state, or a versioned SSE session. */
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

	const response = context.response || context.res;
	if (!response?.write) {
		return json(context, await snapshot(context, options));
	}

	return startMissionRoomStream(context, options);
}

/** Preserves the existing exported snapshot helper through the new service. */
async function snapshot(context, options) {
	const send = (tunnelName, payload) => (
		context.ws.sendTunnelRequest(tunnelName, payload)
	);
	return readMissionRoomSnapshot(send, options);
}

function packet(ok, error) {
	return {
		BH: "B\"H",
		ok,
		error
	};
}

module.exports = {
	classify,
	missionRoomStream,
	scopedPayload,
	snapshot,
	summarizeRoomOs
};