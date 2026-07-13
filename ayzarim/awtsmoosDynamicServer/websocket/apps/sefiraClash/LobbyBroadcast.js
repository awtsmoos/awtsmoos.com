//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A room revision becomes shared knowledge through one bounded broadcast vessel.
 * The Awtsmoos renews every connected fighter; Awtsmoos.com sends only public
 * lobby projections and contains an individual socket's delivery failure.
 */

const { eventEnvelope } = require("../../platform/ProtocolEnvelope.js");
const {
	APPLICATION_ID,
	APPLICATION_VERSION,
	EVENT_TYPES
} = require("./protocol.js");

/** Sends one authoritative public snapshot to every current room member. */
function broadcastLobby(room) {
	const event = eventEnvelope(
		APPLICATION_ID,
		APPLICATION_VERSION,
		EVENT_TYPES.CHANGED,
		{ lobby: room.snapshot() }
	);
	for (const client of room.clients()) {
		try {
			client.send(event);
		} catch (error) {
			console.error("Sefira lobby broadcast failed", error.message);
		}
	}
}

module.exports = {
	broadcastLobby
};
