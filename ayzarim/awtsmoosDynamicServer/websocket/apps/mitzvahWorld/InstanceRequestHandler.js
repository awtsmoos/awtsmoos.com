// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InstanceRequestHandler.js
 * @description Handles private instance entry, departure, and snapshots.
 * The Awtsmoos renews world and chamber without division; this Awtsmoos.com
 * handler grants temporary rooms stable membership and explicit lifecycle events.
 */

const {
	commandPayload,
	identifier,
	optionalIdentifier
} = require('./CommandValidation.js');
const { EVENT_TYPES, MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { commandResult, queryResult } = require('./WorldCommandResult.js');

function handleInstanceRequest(context, request, room) {
	const player = room.playerFor(context.client);
	if (request.type === MESSAGE_TYPES.INSTANCE_ENTER) {
		const payload = commandPayload(request.payload);
		const existingId = optionalIdentifier(payload.instanceId, 'Instance id');
		const instance = existingId
			? room.instances.join(player, existingId)
			: room.instances.enter(player, identifier(payload.templateId || 'shlichus', 'Template id'));
		return changed(context, room, RESPONSE_TYPES.INSTANCE_ENTERED, instance);
	}
	if (request.type === MESSAGE_TYPES.INSTANCE_LEAVE) {
		return changed(context, room, RESPONSE_TYPES.INSTANCE_LEFT, room.instances.leave(player));
	}
	if (request.type === MESSAGE_TYPES.INSTANCE_SNAPSHOT) {
		return queryResult(RESPONSE_TYPES.INSTANCE_SNAPSHOT, room.instances.snapshotFor(player));
	}
	return null;
}

function changed(context, room, type, instance) {
	room.record('instance.updated', { instance });
	for (const client of room.clients()) {
		context.sendEvent(client, EVENT_TYPES.INSTANCE_CHANGED, { instance });
	}
	return commandResult(type, { instance }, { broadcast: true });
}

module.exports = {
	handleInstanceRequest
};
