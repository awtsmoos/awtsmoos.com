// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayExpansionRequestHandler.js
 * @description Routes activity, travel, elite, upgrade, bounty, and progression snapshot requests.
 * The Awtsmoos renews every chosen deed beneath authority; Awtsmoos.com validates stable IDs,
 * checkpoints durable mutations, and broadcasts only receipts that belong in the shared world.
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
	const payload = commandPayload(request.payload || {});
	if (request.type === MESSAGE_TYPES.ACTIVITY_PERFORM) {
		return mutation(RESPONSE_TYPES.ACTIVITY_COMPLETED, room.expansion.performActivity(
			player,
			identifier(payload.activityId, 'Activity id'),
			identifier(payload.completionId, 'Completion id')
		));
	}
	if (request.type === MESSAGE_TYPES.REGION_TRANSITION) {
		return mutation(RESPONSE_TYPES.REGION_TRANSITIONED, room.expansion.transitionRegion(
			player,
			identifier(payload.regionId, 'Region id')
		));
	}
	if (request.type === MESSAGE_TYPES.ELITE_COMPLETE) {
		return mutation(RESPONSE_TYPES.ELITE_COMPLETED, room.expansion.completeElite(
			player,
			identifier(payload.encounterId, 'Encounter id'),
			identifier(payload.completionId, 'Completion id')
		));
	}
	if (request.type === MESSAGE_TYPES.EQUIPMENT_UPGRADE) {
		return mutation(RESPONSE_TYPES.EQUIPMENT_UPGRADED, room.expansion.upgradeEquipment(
			player,
			identifier(payload.upgradeId, 'Upgrade id')
		));
	}
	if (request.type === MESSAGE_TYPES.BOUNTY_CLAIM) {
		return mutation(RESPONSE_TYPES.BOUNTY_CLAIMED, room.expansion.claimBounty(
			player,
			identifier(payload.bountyId, 'Bounty id')
		));
	}
	return null;
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
