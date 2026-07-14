// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { dispatchJoinedRequest } = require('./JoinedRequestHandlers.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { validateJoin } = require('./validation.js');
const { broadcastWorldChanges } = require('./WorldEventBroadcaster.js');

/**
 * @file Routes every version-one Mitzvah World command through focused owners.
 * @description The Awtsmoos renews many requests beneath one replay covenant.
 * Awtsmoos.com is remembered here as join, replay, checkpoint, and response policy
 * remain unified while every joined domain lives in its own bounded handler vessel.
 */

function dispatchWorldRequest(directory, context, request) {
	if (request.type === MESSAGE_TYPES.WORLD_JOIN) {
		return handleJoin(directory, context, request);
	}
	const begun = directory.beginRequest(context.client, request);
	if (begun.duplicate) {
		return begun.result;
	}
	const room = directory.forClient(context.client);
	const command = dispatchJoinedRequest(directory, context, request, room);
	if (!command) {
		throw new RealtimeError(
			'UNKNOWN_MESSAGE',
			`Unknown Mitzvah World message: ${request.type}`
		);
	}
	if (command.broadcast) {
		broadcastWorldChanges(context, room);
	}
	if (
		request.type === MESSAGE_TYPES.WORLD_LEAVE ||
		request.type === MESSAGE_TYPES.SESSION_REVOKE
	) {
		return command.response;
	}
	return complete(directory, context.client, request, begun, command);
}

function handleJoin(directory, context, request) {
	const joined = directory.join(context.client, validateJoin(request.payload));
	const begun = directory.beginRequest(context.client, request);
	if (begun.duplicate) {
		return begun.result;
	}
	const command = {
		broadcast: true,
		checkpoint: true,
		response: {
			payload: {
				playerId: joined.player.id,
				resumed: joined.resumed,
				session: joined.session,
				world: joined.room.snapshot()
			},
			type: RESPONSE_TYPES.WORLD_JOINED
		}
	};
	broadcastWorldChanges(context, joined.room);
	return complete(directory, context.client, request, begun, command);
}

function complete(directory, client, request, begun, command) {
	directory.rememberResponse(
		client,
		request.requestId,
		begun.fingerprint,
		command.response
	);
	if (command.checkpoint) {
		directory.checkpoint();
	}
	return command.response;
}

module.exports = {
	dispatchWorldRequest
};
