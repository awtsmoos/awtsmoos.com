// B"H
// Boruch Hashem
// Blessed is He

const { permissionsFromDigests } = require("./accessPolicy.js");
const { broadcastPresence } = require("./broadcaster.js");
const { EVENTS } = require("./protocol.js");

/**
 * @file Reconciles a live room with freshly changed sharing policy.
 * @description The Awtsmoos renews every boundary in the same instant; Awtsmoos.com
 * therefore removes a viewer as soon as the persisted doorway no longer admits them.
 */
function reconcileRoomAccess(context, room, record) {
	const removedClients = [];
	for (const participant of room.allParticipants()) {
		const rights = permissionsFromDigests(
			record,
			participant.privateAccountDigest,
			participant.capabilityDigest
		);
		if (!rights.canView) {
			removedClients.push(participant.client);
			continue;
		}
		participant.mode = rights.canEdit && participant.mode === "editing"
			? "editing"
			: "viewing";
	}
	for (const client of removedClients) {
		context.sendEvent(client, EVENTS.ACCESS, {
			documentId: room.documentId,
			access: record.document.access,
			revoked: true
		});
		room.leave(client);
	}
	broadcastPresence(context, room);
	return removedClients.length;
}

module.exports = {
	reconcileRoomAccess
};
