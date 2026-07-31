// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatActionRequest.js
 * @description Validates attack, defense, and creature-care command payloads for the combat router.
 * The Awtsmoos gives each request a bounded name before consequence may enter the room;
 * Awtsmoos.com keeps identifiers, timing, intent, care progress, and mutation receipts explicit.
 */

const {
	boundedNumber,
	commandPayload,
	identifier,
	oneOf
} = require('./CommandValidation.js');
const { RESPONSE_TYPES } = require('./protocol.js');
const { commandResult } = require('./WorldCommandResult.js');

function attackRequest(player, request, room) {
	const payload = commandPayload(request.payload);
	return mutation(RESPONSE_TYPES.COMBAT_ATTACKED, room.combat.attack(player, {
		actionId: identifier(payload.actionId, 'Action id'),
		creatureId: identifier(payload.creatureId, 'Creature id'),
		elapsedSeconds: boundedNumber(
			payload.elapsedSeconds,
			'Action elapsed seconds',
			0,
			10
		),
		impactToken: identifier(payload.impactToken, 'Impact token'),
		intent: oneOf(
			payload.intent || 'defense',
			['defense', 'harvest'],
			'Attack intent'
		),
		weaponId: identifier(payload.weaponId, 'Weapon id')
	}));
}

function defendRequest(player, request, room) {
	const payload = commandPayload(request.payload);
	return mutation(
		RESPONSE_TYPES.COMBAT_DEFENDED,
		room.combat.defend(
			player,
			identifier(payload.actionId, 'Defense action id')
		)
	);
}

function careRequest(player, request, room) {
	const payload = commandPayload(request.payload);
	const creatureId = identifier(payload.creatureId, 'Creature id');
	const authoritative = room.creatures.get(creatureId);
	const outcome = room.creatures.care(player, creatureId);
	const adventures = outcome.newlyCared
		? room.adventures.recordEvent(player, {
			count: 1,
			kosherEligible: authoritative.kosherEligible,
			target: authoritative.speciesId,
			type: 'care'
		})
		: [];
	return mutation(RESPONSE_TYPES.CREATURE_CARED, {
		...outcome,
		adventures
	});
}

function mutation(type, payload) {
	return commandResult(type, payload, {
		broadcast: true,
		checkpoint: true
	});
}

module.exports = {
	attackRequest,
	careRequest,
	defendRequest,
	mutation
};
