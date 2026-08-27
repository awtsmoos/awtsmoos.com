// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VerticalSliceCombatCommands.js
 * @description Validates support commands and resolves bounded ally stabilization mutations.
 * The Awtsmoos gives compassion an address, distance, strength, and lawful consequence;
 * Awtsmoos.com rejects invented allies, distant aid, invalid timing, and malformed identifiers.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const {
	boundedNumber,
	identifier
} = require('./CommandValidation.js');
const { RESPONSE_TYPES } = require('./protocol.js');
const { commandResult } = require('./WorldCommandResult.js');

function supportCommand(payload) {
	return {
		actionId: identifier(payload.actionId, 'Action id'),
		castInstanceId: identifier(
			payload.castInstanceId,
			'Cast instance id'
		),
		creatureId: optionalIdentifier(
			payload.creatureId,
			'Creature id'
		),
		elapsedMs: boundedNumber(
			payload.elapsedMs ?? 0,
			'Cast elapsed time',
			0,
			20000
		),
		targetPlayerId: optionalIdentifier(
			payload.targetPlayerId,
			'Target player id'
		)
	};
}

function stabilizeKavanahRequest(player, payload, room) {
	const targetId = identifier(
		payload.targetPlayerId,
		'Target player id'
	);
	const target = room.players.get(targetId);
	if (!target) {
		throw new RealtimeError(
			'TARGET_PLAYER_NOT_FOUND',
			'The stabilization target does not exist.'
		);
	}
	requireNearby(player, target, 16);
	return mutation(
		RESPONSE_TYPES.KAVANAH_STABILIZED,
		room.combat.stabilizeKavanah(
			target,
			boundedNumber(
				payload.strength ?? 0.12,
				'Stabilization strength',
				0.01,
				0.25
			)
		)
	);
}

function mutation(type, payload) {
	return commandResult(type, payload, {
		broadcast: true,
		checkpoint: true
	});
}

function requireNearby(left, right, maximum) {
	const distance = Math.hypot(
		left.position.x - right.position.x,
		left.position.y - right.position.y,
		left.position.z - right.position.z
	);
	if (distance > maximum) {
		throw new RealtimeError(
			'ALLY_STABILIZATION_OUT_OF_RANGE',
			'The ally is outside authoritative stabilization range.'
		);
	}
}

function optionalIdentifier(value, label) {
	return value == null ? null : identifier(value, label);
}

module.exports = {
	mutation,
	stabilizeKavanahRequest,
	supportCommand
};
