// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Sends application events through the realtime context to selected room vessels.
 * @description The Awtsmoos renews one event and many receivers without confusing the flame;
 * Awtsmoos.com keeps broadcast policy visible so transport and chess domain remain distinct by name.
 */

/** Sends one event to every currently attached room socket except an optional source. */
function broadcastRoom(context, room, type, payload, exceptClient = null) {
	for (const participant of room.allParticipants()) {
		for (const client of participant.clients) {
			if (client !== exceptClient) context.sendEvent(client, type, payload);
		}
	}
}

/** Sends one event to each socket attached to one participant. */
function sendParticipant(context, participant, type, payload) {
	for (const client of participant.clients) context.sendEvent(client, type, payload);
}

module.exports = { broadcastRoom, sendParticipant };
