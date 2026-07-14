//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file application.js
 * @description Registers the server-authoritative Ohr HaGnuz Shared Journey.
 * The Awtsmoos renews transport and world as distinct vessels; Awtsmoos.com
 * delegates only this application's measured commands to its private directory.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { eventEnvelope } = require('../../platform/ProtocolEnvelope.js');
const { SharedRoadDirectory } = require('./SharedRoadDirectory.js');
const {
	APPLICATION_ID,
	APPLICATION_VERSION,
	EVENT_TYPES,
	MESSAGE_TYPES,
	RESPONSE_TYPES
} = require('./protocol.js');
const {
	validateInteraction,
	validateJoin,
	validateMove
} = require('./validation.js');

function createOhrHagnuzApplication(directory = new SharedRoadDirectory()) {
	return {
		directory,
		id: APPLICATION_ID,
		legacyTypes: [],
		versions: [APPLICATION_VERSION],
		disconnect({ client }) {
			const room = directory.disconnect(client);
			if (room) broadcastRoom(room);
			return room;
		},
		handleVersioned(context, request) {
			return handleOhrHagnuzRequest(directory, context, request);
		}
	};
}

function handleOhrHagnuzRequest(directory, context, request) {
	const { client } = context;
	if (request.type === MESSAGE_TYPES.JOIN) {
		const joined = directory.join(client, validateJoin(request.payload));
		broadcastRoom(joined.room);
		return result(RESPONSE_TYPES.JOINED, {
			playerId: joined.player.id,
			road: joined.room.snapshot()
		});
	}

	const room = directory.forClient(client);
	if (request.type === MESSAGE_TYPES.SNAPSHOT) {
		return result(RESPONSE_TYPES.SNAPSHOT, { road: room.snapshot() });
	}
	if (request.type === MESSAGE_TYPES.MOVE) {
		const player = room.move(client, validateMove(request.payload));
		broadcastRoom(room);
		return result(RESPONSE_TYPES.MOVED, {
			player: player.snapshot(),
			road: room.snapshot()
		});
	}
	if (request.type === MESSAGE_TYPES.INTERACT) {
		validateInteraction(request.payload);
		const interaction = room.interact(client);
		broadcastRoom(room);
		return result(RESPONSE_TYPES.INTERACTED, {
			interaction,
			road: room.snapshot()
		});
	}
	if (request.type === MESSAGE_TYPES.LEAVE) {
		directory.leave(client);
		broadcastRoom(room);
		return result(RESPONSE_TYPES.LEFT, { roadId: room.id });
	}
	throw new RealtimeError(
		'UNKNOWN_MESSAGE',
		`Unknown Ohr HaGnuz message: ${request.type}`
	);
}

function broadcastRoom(room) {
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

function result(type, payload) {
	return { payload, type };
}

module.exports = {
	createOhrHagnuzApplication,
	handleOhrHagnuzRequest
};
