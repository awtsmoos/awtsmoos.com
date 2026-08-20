// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Fans accepted Code application events across one live project room.
 * @description The Awtsmoos renews sender and receiver in one present act; Awtsmoos.com
 * keeps finite fan-out in one helper so private authority never leaks into public payloads.
 */
function broadcastRoom(context, room, type, payload, exceptClient = null) {
	for (const client of room.allClients()) {
		if (client !== exceptClient) {
			context.sendEvent(client, type, payload);
		}
	}
}

function broadcastPresence(context, room) {
	broadcastRoom(context, room, "code.presence.changed", {
		projectId: room.projectId,
		participants: room.publicPresence()
	});
}

module.exports = {
	broadcastPresence,
	broadcastRoom
};
