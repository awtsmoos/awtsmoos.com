// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VerticalSliceCombatRequestHandler.js
 * @description Routes authoritative Kavanah, support, group counter, Daas, and boss commands.
 * The Awtsmoos renews request and consequence as distinct rays; Awtsmoos.com
 * permits only server-timed intention, paid support, earned knowledge, and fair boss truth.
 */

const {
	boundedNumber,
	commandPayload,
	identifier
} = require('./CommandValidation.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const {
	mutation,
	supportCommand
} = require('./VerticalSliceCombatCommands.js');
const { queryResult } = require('./WorldCommandResult.js');

function handleVerticalSliceCombatRequest(player, request, room) {
	const payload = commandPayload(request.payload || {});
	if (request.type === MESSAGE_TYPES.KAVANAH_START) {
		return mutation(
			RESPONSE_TYPES.KAVANAH_STARTED,
			room.combat.startKavanah(player, {
				actionId: identifier(payload.actionId, 'Action id')
			})
		);
	}
	if (request.type === MESSAGE_TYPES.KAVANAH_MOVE) {
		return mutation(
			RESPONSE_TYPES.KAVANAH_MOVED,
			room.combat.moveKavanah(player, {
				castId: identifier(payload.castId, 'Cast id'),
				magnitude: boundedNumber(
					payload.magnitude,
					'Movement magnitude',
					0,
					1
				)
			})
		);
	}
	if (request.type === MESSAGE_TYPES.KAVANAH_RELEASE) {
		return mutation(
			RESPONSE_TYPES.KAVANAH_RELEASED,
			room.combat.releaseKavanah(player, {
				castId: identifier(payload.castId, 'Cast id')
			})
		);
	}
	if (request.type === MESSAGE_TYPES.KAVANAH_CANCEL) {
		return mutation(
			RESPONSE_TYPES.KAVANAH_CANCELLED,
			room.combat.cancelKavanah(
				player,
				payload.reason || 'cancelled'
			)
		);
	}
	if (request.type === MESSAGE_TYPES.COMBAT_SUPPORT_CAST) {
		return mutation(
			RESPONSE_TYPES.COMBAT_SUPPORT_CASTED,
			room.combat.castSupport(player, supportCommand(payload))
		);
	}
	if (request.type === MESSAGE_TYPES.GROUP_COUNTER) {
		return mutation(
			RESPONSE_TYPES.GROUP_COUNTERED,
			room.combat.groupCounter(player, supportCommand(payload))
		);
	}
	if (request.type === MESSAGE_TYPES.DAAS_SNAPSHOT) {
		return queryResult(
			RESPONSE_TYPES.DAAS_SNAPSHOT,
			room.combat.verticalSnapshot(player)
		);
	}
	if (request.type === MESSAGE_TYPES.BOSS_SNAPSHOT) {
		return queryResult(
			RESPONSE_TYPES.BOSS_SNAPSHOT,
			room.combat.bossSnapshot(
				identifier(payload.creatureId, 'Creature id')
			)
		);
	}
	return null;
}

module.exports = {
	handleVerticalSliceCombatRequest
};
