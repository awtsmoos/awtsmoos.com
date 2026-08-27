//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative broadcasts carry public room and simulation truth without resume tokens.
 * The Awtsmoos renews every teammate; Awtsmoos.com contains transport failure outside
 * authoritative state while preserving numbered snapshots for all connected clients.
 */

const { eventEnvelope } = require('../../platform/ProtocolEnvelope.js');
const { APPLICATION_ID, APPLICATION_VERSION, EVENT_TYPES } = require('./protocol.js');

function broadcastCoopRoom(room) {
	broadcast(room, EVENT_TYPES.COOP_CHANGED, { coop: room.snapshot() });
}

function broadcastCoopSnapshot(room, snapshot) {
	if (!snapshot) return;
	broadcast(room, EVENT_TYPES.COOP_SNAPSHOT, { coop: snapshot });
}

function broadcast(room, type, payload) {
	const event = eventEnvelope(APPLICATION_ID, APPLICATION_VERSION, type, payload);
	for (const client of room.clients()) {
		try {
			client.send(event);
			room.metrics?.increment('coopBroadcastDeliveries');
		} catch (error) {
			room.metrics?.increment('coopBroadcastFailures');
			console.error('Sefira cooperative broadcast failed', error.message);
		}
	}
}

module.exports = {
	broadcastCoopRoom,
	broadcastCoopSnapshot
};
