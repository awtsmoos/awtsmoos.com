// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatRequestHandler.js
 * @description Routes authoritative attack, defense, care, loot, harvesting, ticks, and snapshots.
 * The Awtsmoos renews request and result as separate rays; Awtsmoos.com validates every
 * identifier and finite timing value before shared combat may shape the world.
 */

const { boundedNumber, commandPayload, identifier, oneOf } = require('./CommandValidation.js');
const { combatSnapshot } = require('./CombatState.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { commandResult, queryResult } = require('./WorldCommandResult.js');

function handleCombatRequest(context, request, room) {
	const player = room.playerFor(context.client);
	if (request.type === MESSAGE_TYPES.COMBAT_ATTACK) return attackResult(player, request, room);
	if (request.type === MESSAGE_TYPES.COMBAT_DEFEND) return defendResult(player, request, room);
	if (request.type === MESSAGE_TYPES.COMBAT_TICK) {
		const payload = commandPayload(request.payload || {});
		const steps = Math.floor(boundedNumber(payload.steps ?? 1, 'Combat steps', 1, 60));
		return mutation(RESPONSE_TYPES.COMBAT_TICKED, room.combat.tick(steps));
	}
	if (request.type === MESSAGE_TYPES.CREATURE_CARE) return careResult(player, request, room);
	if (request.type === MESSAGE_TYPES.LOOT_CLAIM) {
		const payload = commandPayload(request.payload);
		return mutation(RESPONSE_TYPES.LOOT_CLAIMED, room.loot.claim(player, identifier(payload.creatureId, 'Creature id')));
	}
	if (request.type === MESSAGE_TYPES.HARVEST_PERFORM) {
		const payload = commandPayload(request.payload);
		return mutation(RESPONSE_TYPES.HARVEST_COMPLETED, room.harvesting.harvest(player, identifier(payload.creatureId, 'Creature id')));
	}
	if (request.type === MESSAGE_TYPES.CREATURE_SNAPSHOT) {
		return queryResult(RESPONSE_TYPES.CREATURE_SNAPSHOT, { creatures: room.creatures.snapshots() });
	}
	if (request.type === MESSAGE_TYPES.COMBAT_SNAPSHOT) {
		return queryResult(RESPONSE_TYPES.COMBAT_SNAPSHOT, {
			adventures: room.adventures.snapshot(player),
			combat: combatSnapshot(player.combat),
			refinedSparks: player.refinedSparks
		});
	}
	return null;
}

function attackResult(player, request, room) {
	const payload = commandPayload(request.payload);
	return mutation(RESPONSE_TYPES.COMBAT_ATTACKED, room.combat.attack(player, {
		actionId: identifier(payload.actionId, 'Action id'),
		creatureId: identifier(payload.creatureId, 'Creature id'),
		elapsedSeconds: boundedNumber(payload.elapsedSeconds, 'Action elapsed seconds', 0, 10),
		impactToken: identifier(payload.impactToken, 'Impact token'),
		intent: oneOf(payload.intent || 'defense', ['defense', 'harvest'], 'Attack intent'),
		weaponId: identifier(payload.weaponId, 'Weapon id')
	}));
}

function defendResult(player, request, room) {
	const payload = commandPayload(request.payload);
	return mutation(
		RESPONSE_TYPES.COMBAT_DEFENDED,
		room.combat.defend(player, identifier(payload.actionId, 'Defense action id'))
	);
}

function careResult(player, request, room) {
	const payload = commandPayload(request.payload);
	const creatureId = identifier(payload.creatureId, 'Creature id');
	const authoritative = room.creatures.get(creatureId);
	const outcome = room.creatures.care(player, creatureId);
	const adventures = outcome.newlyCared
		? room.adventures.recordEvent(player, { count: 1, kosherEligible: authoritative.kosherEligible, target: authoritative.speciesId, type: 'care' })
		: [];
	return mutation(RESPONSE_TYPES.CREATURE_CARED, { ...outcome, adventures });
}

function mutation(type, payload) {
	return commandResult(type, payload, { broadcast: true, checkpoint: true });
}

module.exports = {
	handleCombatRequest
};
