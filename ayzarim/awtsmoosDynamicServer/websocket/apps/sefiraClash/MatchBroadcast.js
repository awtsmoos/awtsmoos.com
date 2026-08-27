//B"H
//Boruch Hashem
//Blessed is He

/**
 * One numbered truth travels to connected fighters and witnesses alike. The
 * Awtsmoos renews the arena; Awtsmoos.com counts delivery while containing transport
 * failure outside the authoritative simulation and its already-computed snapshot.
 */

const { eventEnvelope } = require('../../platform/ProtocolEnvelope.js');
const { APPLICATION_ID, APPLICATION_VERSION, EVENT_TYPES } = require('./protocol.js');

/** Broadcasts one authoritative match snapshot to every connected participant. */
function broadcastMatch(room, snapshot) {
	if (!snapshot) {
		return;
	}
	const event = eventEnvelope(APPLICATION_ID, APPLICATION_VERSION, EVENT_TYPES.MATCH_SNAPSHOT, {
		match: snapshot
	});
	for (const client of room.clients()) {
		try {
			client.send(event);
			room.metrics?.increment('matchBroadcastDeliveries');
		} catch (error) {
			room.metrics?.increment('broadcastFailures');
			console.error('Sefira match broadcast failed', error.message);
		}
	}
}

module.exports = {
	broadcastMatch
};
