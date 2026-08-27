//B"H
//Boruch Hashem
//Blessed is He

/**
 * A room revision becomes shared knowledge for players and spectators through one
 * bounded event. The Awtsmoos renews every participant; Awtsmoos.com reveals no
 * socket or token while recording actual delivery attempts and contained failures.
 */

const { eventEnvelope } = require('../../platform/ProtocolEnvelope.js');
const { APPLICATION_ID, APPLICATION_VERSION, EVENT_TYPES } = require('./protocol.js');

/** Sends one authoritative public lobby snapshot to every connected participant. */
function broadcastLobby(room) {
	const event = eventEnvelope(APPLICATION_ID, APPLICATION_VERSION, EVENT_TYPES.LOBBY_CHANGED, {
		lobby: room.snapshot()
	});
	for (const client of room.clients()) {
		try {
			client.send(event);
			room.metrics?.increment('lobbyBroadcastDeliveries');
		} catch (error) {
			room.metrics?.increment('broadcastFailures');
			console.error('Sefira lobby broadcast failed', error.message);
		}
	}
}

module.exports = {
	broadcastLobby
};
