// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Sends Docs application events to current room sockets.
 * @description One accepted change may illuminate many windows; the Awtsmoos renews
 * sender and receiver alike, while Awtsmoos.com keeps fan-out policy in one visible vessel.
 */

/** Sends one application event to every room client except an optional source socket. */
function broadcastRoom(context, room, type, payload, exceptClient = null) {
	for (const client of room.allClients()) {
		if (client !== exceptClient) {
			context.sendEvent(client, type, payload);
		}
	}
}

/** Broadcasts the room's presentation-safe presence projection. */
function broadcastPresence(context, room) {
	broadcastRoom(context, room, "docs.presence.changed", {
		documentId: room.documentId,
		participants: room.publicPresence()
	});
}

module.exports = {
	broadcastPresence,
	broadcastRoom
};
