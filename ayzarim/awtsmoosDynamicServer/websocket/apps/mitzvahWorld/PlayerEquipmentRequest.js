// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerEquipmentRequest.js
 * @description Validates private equipment snapshots, equip commands, and unequips.
 * The Awtsmoos renews each garment beyond possession; Awtsmoos.com permits a vessel
 * to occupy a slot only through authoritative inventory truth and bounded identifiers.
 */

const {
	commandPayload,
	identifier,
	oneOf,
	optionalIdentifier
} = require('./CommandValidation.js');
const { RESPONSE_TYPES } = require('./protocol.js');
const {
	commandResult,
	queryResult
} = require('./WorldCommandResult.js');

function handlePlayerEquipmentRequest(room, player, rawPayload) {
	const payload = commandPayload(rawPayload || {});
	const operation = oneOf(
		payload.operation || 'snapshot',
		['equip', 'snapshot', 'unequip'],
		'Equipment operation'
	);
	if (operation === 'snapshot') {
		return queryResult(
			RESPONSE_TYPES.PLAYER_EQUIPMENT,
			room.inventory.snapshot(player)
		);
	}
	const result = operation === 'equip'
		? room.inventory.equip(
			player,
			identifier(payload.itemId, 'Item id'),
			optionalIdentifier(payload.slot, 'Equipment slot')
		)
		: room.inventory.unequip(
			player,
			identifier(payload.slot, 'Equipment slot')
		);
	return commandResult(
		RESPONSE_TYPES.PLAYER_EQUIPMENT,
		result,
		{ broadcast: true, checkpoint: true }
	);
}

module.exports = {
	handlePlayerEquipmentRequest
};
