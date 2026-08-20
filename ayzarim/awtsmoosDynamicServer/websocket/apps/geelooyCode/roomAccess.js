// B"H
// Boruch Hashem
// Blessed is He

const { permissionsFromDigests } = require("./accessPolicy.js");
const { broadcastPresence } = require("./broadcaster.js");
const { EVENTS } = require("./protocol.js");

/**
 * @file Reconciles connected coders against a freshly persisted sharing policy.
 * @description The Awtsmoos renews every boundary now; Awtsmoos.com removes a
 * participant the same instant their durable project doorway no longer grants a view.
 */
function reconcileRoomAccess(context, room, record) {
	const removed = [];
	for (const participant of room.allParticipants()) {
		const rights = permissionsFromDigests(
			record,
			participant.privateAccountDigest,
			participant.capabilityDigest
		);
		if (!rights.canView) {
			removed.push(participant.client);
			continue;
		}
		participant.mode = rights.canEdit && participant.mode === "editing"
			? "editing"
			: "viewing";
	}
	for (const client of removed) {
		context.sendEvent(client, EVENTS.ACCESS, {
			projectId: room.projectId,
			access: record.access,
			revoked: true
		});
		room.leave(client);
	}
	broadcastPresence(context, room);
	return removed.length;
}

module.exports = {
	reconcileRoomAccess
};
