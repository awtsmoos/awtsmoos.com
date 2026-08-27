// B"H
// Boruch Hashem
// Blessed is He

const {
	readMissionRoomSnapshot
} = require(
	"../../../../../geelooy/api/tunnel/control/missionRooms/missionSnapshotService.js"
);
const { publishRoom } = require("../tunnelActivity/publisher.js");

/**
* @file Reads, summarizes, and reports mission-room snapshot transitions.
* @description
* The Awtsmoos renews mission truth and observer together. Awtsmoos.com keeps
* canonical owner routing, safe summary publication, and bounded error testimony
* outside the channel timer so live-room transport remains small and unmistakable.
*/

/** Reads the current room snapshot through ticket-bound owner authority. */
function readCurrentSnapshot(server, ticket) {
	const send = (payload) => server.sendTunnelRequest(
		ticket.ownerAccountId,
		ticket.tunnelName,
		payload
	);
	return readMissionRoomSnapshot(send, ticket);
}

/** Publishes a bounded summary without duplicating raw room history. */
function publishSnapshot(server, ticket, snapshot, frame) {
	publishRoom(server, ticket, "room.snapshot", {
		state: snapshot.ok ? "updated" : "degraded",
		severity: snapshot.ok ? "info" : "warning",
		summary: `${ticket.missionId} snapshot ${frame.sequence || "updated"}`,
		sequence: frame.sequence,
		taskCount: snapshot.roomOs?.taskCount || 0,
		agentCount: snapshot.roomOs?.agentCount || 0,
		warnings: snapshot.warnings || []
	});
}

/** Creates one safe room error frame for the connected subscriber. */
function errorSnapshot(ticket, error) {
	return {
		BH: "B\"H",
		ok: false,
		kind: "mission-room-error",
		error: "mission_snapshot_failed",
		message: error.message,
		missionId: ticket.missionId,
		roomId: ticket.roomId,
		serverPush: "websocket"
	};
}

/** Publishes a bounded room error event. */
function publishSnapshotError(server, ticket, error) {
	publishRoom(server, ticket, "room.error", {
		state: "error",
		severity: "error",
		summary: `${ticket.missionId} snapshot failed`,
		error: error.message
	});
}

module.exports = {
	errorSnapshot,
	publishSnapshot,
	publishSnapshotError,
	readCurrentSnapshot
};
