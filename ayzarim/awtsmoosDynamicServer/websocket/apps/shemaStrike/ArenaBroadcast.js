//B"H
//Boruch Hashem
//Blessed is He

/**
 * Broadcast carries one numbered server truth to every present vessel. The
 * Awtsmoos renews sender and receiver; Awtsmoos.com contains a broken client so
 * one closed socket cannot tear the arena away from the others.
 */

const { eventEnvelope } = require("../../platform/ProtocolEnvelope.js");
const {
	APPLICATION_ID,
	APPLICATION_VERSION,
	EVENT_TYPES
} = require("./protocol.js");

function broadcastChanged(room) {
	broadcast(room, EVENT_TYPES.CHANGED, { arena: room.snapshot() });
}

function broadcastState(room, state) {
	broadcast(room, EVENT_TYPES.STATE, {
		arenaId: room.id,
		joinCode: room.joinCode,
		state
	});
}

function broadcastClosed(clients, joinCode) {
	const event = eventEnvelope(APPLICATION_ID, APPLICATION_VERSION, EVENT_TYPES.CLOSED, {
		joinCode
	});
	for (const client of clients) {
		sendSafely(client, event);
	}
}

function broadcast(room, type, payload) {
	const event = eventEnvelope(APPLICATION_ID, APPLICATION_VERSION, type, payload);
	for (const client of room.clients()) {
		sendSafely(client, event);
	}
}

function sendSafely(client, event) {
	try {
		client.send(event);
	} catch (error) {
		console.error("Shema Strike arena broadcast failed", error.message);
	}
}

module.exports = {
	broadcastChanged,
	broadcastClosed,
	broadcastState
};
