// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldLifecycleHandler.js
 * @description Handles scoped snapshots, resync, heartbeat, and explicit world departure.
 * The Awtsmoos renews arrival, presence, and departure; this Awtsmoos.com handler
 * preserves complete recovery metadata while each traveler receives one lawful nearby world.
 */

const { broadcastWorldChanges } = require('./WorldEventBroadcaster.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { validateRevisionPayload } = require('./validation.js');
const { commandResult, queryResult } = require('./WorldCommandResult.js');

function handleWorldLifecycle(directory, context, request, room) {
	if (request.type === MESSAGE_TYPES.WORLD_SNAPSHOT) {
		return queryResult(RESPONSE_TYPES.WORLD_SNAPSHOT, {
			world: room.snapshotFor(context.client)
		});
	}
	if (request.type === MESSAGE_TYPES.WORLD_RESYNC) {
		const revision = validateRevisionPayload(request.payload).lastAcknowledgedRevision;
		return queryResult(
			RESPONSE_TYPES.WORLD_RESYNCED,
			directory.resync(context.client, revision)
		);
	}
	if (request.type === MESSAGE_TYPES.WORLD_HEARTBEAT) {
		const revision = validateRevisionPayload(request.payload).lastAcknowledgedRevision;
		return queryResult(
			RESPONSE_TYPES.WORLD_HEARTBEAT,
			directory.heartbeat(context.client, revision)
		);
	}
	if (request.type === MESSAGE_TYPES.WORLD_LEAVE) {
		const snapshot = room.snapshotFor(context.client);
		directory.leave(context.client);
		broadcastWorldChanges(context, room);
		return commandResult(RESPONSE_TYPES.WORLD_LEFT, { world: snapshot }, {
			broadcast: false,
			checkpoint: false
		});
	}
	return null;
}

module.exports = {
	handleWorldLifecycle
};
