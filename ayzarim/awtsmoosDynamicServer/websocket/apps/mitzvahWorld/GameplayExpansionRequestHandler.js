// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayExpansionRequestHandler.js
 * @description Routes durable activity, elite, region, and progression commands.
 * The Awtsmoos receives many intentions through one gate; Awtsmoos.com validates each
 * identifier before authoritative mutation, checkpoint persistence, and world broadcast.
 */

const { commandPayload, identifier } = require('./CommandValidation.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { commandResult, queryResult } = require('./WorldCommandResult.js');

function handleGameplayExpansionRequest(context, request, room) {
	const player = room.playerFor(context.client);
	if (request.type === MESSAGE_TYPES.PROGRESSION_SNAPSHOT) {
		return queryResult(
			RESPONSE_TYPES.PROGRESSION_SNAPSHOT,
			room.expansion.snapshot(player)
		);
	}
	if (request.type === MESSAGE_TYPES.ACTIVITY_PERFORM) {
		return activityResult(player, request, room);
	}
	if (request.type === MESSAGE_TYPES.REGION_TRANSITION) {
		return regionResult(player, request, room);
	}
	if (request.type === MESSAGE_TYPES.ELITE_COMPLETE) {
		return eliteResult(player, request, room);
	}
	return null;
}

function activityResult(player, request, room) {
	const payload = commandPayload(request.payload);
	const activityId = identifier(payload.activityId, 'Activity id');
	return mutation(
		RESPONSE_TYPES.ACTIVITY_COMPLETED,
		room.expansion.performActivity(player, activityId)
	);
}

function regionResult(player, request, room) {
	const payload = commandPayload(request.payload);
	const regionId = identifier(payload.regionId, 'Region id');
	return mutation(
		RESPONSE_TYPES.REGION_TRANSITIONED,
		room.expansion.transition(player, regionId)
	);
}

function eliteResult(player, request, room) {
	const payload = commandPayload(request.payload);
	const encounterId = identifier(payload.encounterId, 'Encounter id');
	const completionId = identifier(payload.completionId, 'Completion id');
	return mutation(
		RESPONSE_TYPES.ELITE_COMPLETED,
		room.expansion.completeElite(player, encounterId, completionId)
	);
}

function mutation(type, payload) {
	return commandResult(type, payload, {
		broadcast: true,
		checkpoint: true
	});
}

module.exports = {
	handleGameplayExpansionRequest
};
