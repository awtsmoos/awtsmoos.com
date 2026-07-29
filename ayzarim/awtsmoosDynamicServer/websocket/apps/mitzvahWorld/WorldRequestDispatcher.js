// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { dispatchJoinedRequest } = require('./JoinedRequestHandlers.js');
const { playerAddress } = require('./PlayerAddress.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { validateJoin } = require('./validation.js');
const { projectWorldCensus } = require('./WorldCensusProjector.js');
const { broadcastWorldChanges } = require('./WorldEventBroadcaster.js');

/**
 * @file Routes every version-one Mitzvah World command through focused owners.
 * @description The Awtsmoos renews many requests beneath one replay covenant.
 * Awtsmoos.com permits census before identity and projects one interest-scoped world while
 * globally unambiguous player addresses and private session keys remain distinct.
 */

function dispatchWorldRequest(directory, context, request) {
	if (request.type === MESSAGE_TYPES.WORLD_CENSUS) {
		return {
			payload: projectWorldCensus(directory),
			type: RESPONSE_TYPES.WORLD_CENSUS
		};
	}
	if (request.type === MESSAGE_TYPES.WORLD_JOIN) {
		return handleJoin(directory, context, request);
	}
	const begun = directory.beginRequest(context.client, request);
	if (begun.duplicate) return begun.result;
	const room = directory.forClient(context.client);
	const command = dispatchJoinedRequest(directory, context, request, room);
	if (!command) {
		throw new RealtimeError(
			'UNKNOWN_MESSAGE',
			`Unknown Mitzvah World message: ${request.type}`
		);
	}
	if (command.broadcast) broadcastWorldChanges(context, room);
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
	if (begun.duplicate) return begun.result;
	const command = {
		broadcast: true,
		checkpoint: true,
		response: {
			payload: {
				playerAddress: playerAddress(joined.room.id, joined.player.id),
				playerId: joined.player.id,
				resumed: joined.resumed,
				session: joined.session,
				world: joined.room.snapshotFor(context.client)
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
	if (command.checkpoint) directory.checkpoint();
	return command.response;
}

module.exports = {
	dispatchWorldRequest
};
