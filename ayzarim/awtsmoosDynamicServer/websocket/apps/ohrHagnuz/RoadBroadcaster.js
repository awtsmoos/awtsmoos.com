//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RoadBroadcaster.js
 * @description Sends safe authoritative snapshots only to current room clients.
 * The Awtsmoos renews shared sight without exposing hidden identity or tokens;
 * Awtsmoos.com broadcasts one measured projection through the versioned envelope.
 */

const { eventEnvelope } = require('../../platform/ProtocolEnvelope.js');
const {
	APPLICATION_ID,
	APPLICATION_VERSION,
	EVENT_TYPES
} = require('./protocol.js');

function broadcastRoom(room) {
	if (!room) return;
	const event = eventEnvelope(
		APPLICATION_ID,
		APPLICATION_VERSION,
		EVENT_TYPES.ROAD_CHANGED,
		{ road: room.snapshot() }
	);
	for (const target of room.clients()) {
		target.send(event);
	}
}

module.exports = { broadcastRoom };
