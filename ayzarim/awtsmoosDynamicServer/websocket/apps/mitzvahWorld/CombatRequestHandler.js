// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatRequestHandler.js
 * @description Routes combat mutations, snapshots, care, loot, harvest, and vertical-slice commands.
 * The Awtsmoos renews request and result as separate rays; Awtsmoos.com delegates
 * bounded validation while shared combat may shape the world only through authoritative services.
 */

const {
	attackRequest,
	careRequest,
	defendRequest,
	mutation
} = require('./CombatActionRequest.js');
const {
	boundedNumber,
	commandPayload,
	identifier
} = require('./CommandValidation.js');
const { combatSnapshot } = require('./CombatState.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const {
	handleVerticalSliceCombatRequest
} = require('./VerticalSliceCombatRequestHandler.js');
const { queryResult } = require('./WorldCommandResult.js');

function handleCombatRequest(context, request, room) {
	const player = room.playerFor(context.client);
	const vertical = handleVerticalSliceCombatRequest(player, request, room);
	if (vertical) return vertical;
	if (request.type === MESSAGE_TYPES.COMBAT_ATTACK) {
		return attackRequest(player, request, room);
	}
	if (request.type === MESSAGE_TYPES.COMBAT_DEFEND) {
		return defendRequest(player, request, room);
	}
	if (request.type === MESSAGE_TYPES.COMBAT_TICK) {
		return tickRequest(request, room);
	}
	if (request.type === MESSAGE_TYPES.CREATURE_CARE) {
		return careRequest(player, request, room);
	}
	if (request.type === MESSAGE_TYPES.LOOT_CLAIM) {
		return lootRequest(player, request, room);
	}
	if (request.type === MESSAGE_TYPES.HARVEST_PERFORM) {
		return harvestRequest(player, request, room);
	}
	if (request.type === MESSAGE_TYPES.CREATURE_SNAPSHOT) {
		return queryResult(RESPONSE_TYPES.CREATURE_SNAPSHOT, {
			creatures: room.creatures.snapshots()
		});
	}
	if (request.type === MESSAGE_TYPES.COMBAT_SNAPSHOT) {
		return combatSnapshotRequest(player, room);
	}
	return null;
}

function tickRequest(request, room) {
	const payload = commandPayload(request.payload || {});
	const steps = Math.floor(boundedNumber(
		payload.steps ?? 1,
		'Combat steps',
		1,
		60
	));
	return mutation(
		RESPONSE_TYPES.COMBAT_TICKED,
		room.combat.tick(steps)
	);
}

function lootRequest(player, request, room) {
	const payload = commandPayload(request.payload);
	return mutation(
		RESPONSE_TYPES.LOOT_CLAIMED,
		room.loot.claim(
			player,
			identifier(payload.creatureId, 'Creature id')
		)
	);
}

function harvestRequest(player, request, room) {
	const payload = commandPayload(request.payload);
	return mutation(
		RESPONSE_TYPES.HARVEST_COMPLETED,
		room.harvesting.harvest(
			player,
			identifier(payload.creatureId, 'Creature id')
		)
	);
}

function combatSnapshotRequest(player, room) {
	return queryResult(RESPONSE_TYPES.COMBAT_SNAPSHOT, {
		adventures: room.adventures.snapshot(player),
		combat: combatSnapshot(player.combat),
		refinedSparks: player.refinedSparks,
		verticalSlice: room.combat.verticalSnapshot(player)
	});
}

module.exports = {
	handleCombatRequest
};
