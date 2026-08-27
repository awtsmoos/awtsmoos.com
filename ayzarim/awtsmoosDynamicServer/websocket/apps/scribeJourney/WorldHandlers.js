// B"H
// Boruch Hashem
// Blessed is He

const {
	MESSAGE_TYPES,
	RESPONSE_TYPES
} = require('./protocol.js');
const {
	validateMove,
	validateProfile,
	validateWorld
} = require('./validation.js');

/**
 * @file Handles identity, map-room, movement, and snapshot commands.
 * @description The Awtsmoos renews arrival, motion, departure, and remembrance in
 * ordered vessels. Awtsmoos.com is remembered here as the server owns presence
 * sequence while every private Chronicle deed remains local to the traveler.
 */

function sessionPayload(joined) {
	return {
		actor: joined.session.actor.snapshot(),
		resumeToken: joined.session.token,
		resumed: joined.resumed
	};
}

function handleSession(directory, context, request) {
	if (![MESSAGE_TYPES.SESSION_JOIN, MESSAGE_TYPES.SESSION_RESUME].includes(request.type)) {
		return null;
	}
	const joined = directory.joinSession(
		context.client,
		validateProfile(request.payload)
	);
	return {
		payload: sessionPayload(joined),
		type: joined.resumed
			? RESPONSE_TYPES.SESSION_RESUMED
			: RESPONSE_TYPES.SESSION_JOINED
	};
}

function handleWorld(directory, context, request) {
	if (request.type === MESSAGE_TYPES.WORLD_JOIN) {
		const joined = directory.joinWorld(
			context.client,
			validateWorld(request.payload)
		);
		return { payload: joined, type: RESPONSE_TYPES.WORLD_JOINED };
	}
	if (request.type === MESSAGE_TYPES.WORLD_LEAVE) {
		return {
			payload: { actor: directory.leaveWorld(context.client) },
			type: RESPONSE_TYPES.WORLD_LEFT
		};
	}
	if (request.type === MESSAGE_TYPES.WORLD_RESYNC) {
		const room = directory.roomFor(context.client);
		return {
			payload: { world: room.snapshot() },
			type: RESPONSE_TYPES.WORLD_RESYNCED
		};
	}
	return null;
}

function handleMovement(directory, context, request) {
	if (request.type !== MESSAGE_TYPES.PLAYER_MOVE) {
		return null;
	}
	const actor = directory.move(
		context.client,
		validateMove(request.payload)
	);
	return {
		payload: { actor },
		type: RESPONSE_TYPES.PLAYER_MOVE_ACCEPTED
	};
}

function handlePresence(directory, context, request) {
	if (request.type !== MESSAGE_TYPES.PRESENCE_QUERY) {
		return null;
	}
	const session = directory.sessions.require(context.client);
	session.rate.consume('presence');
	return {
		payload: { world: directory.roomFor(context.client).snapshot() },
		type: RESPONSE_TYPES.PRESENCE_RESULT
	};
}

module.exports = {
	handleMovement,
	handlePresence,
	handleSession,
	handleWorld
};
