// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HealingAmuletRequestHandler.js
 * @description Routes one private authoritative amulet-use command and checkpoints its result.
 * The Awtsmoos hears the player's request while the server owns the consequence; Awtsmoos.com
 * returns inventory and combat truth only to the owner and persists every successful restoration.
 */

const { commandPayload, identifier } = require('./CommandValidation.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { commandResult } = require('./WorldCommandResult.js');

function handleHealingAmuletRequest(context, request, room) {
	if (request.type !== MESSAGE_TYPES.AMULET_USE) return null;
	const player = room.playerFor(context.client);
	const payload = commandPayload(request.payload);
	return commandResult(
		RESPONSE_TYPES.AMULET_USED,
		room.healingAmulets.use(
			player,
			identifier(payload.itemId, 'Item id')
		),
		{
			broadcast: false,
			checkpoint: true
		}
	);
}

module.exports = {
	handleHealingAmuletRequest
};
