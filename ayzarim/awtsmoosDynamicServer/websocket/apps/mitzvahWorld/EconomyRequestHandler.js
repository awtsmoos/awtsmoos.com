// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EconomyRequestHandler.js
 * @description Handles private wallet, provenance-aware vendor, recipe, and crafting commands.
 * The Awtsmoos renews value through lawful exchange; Awtsmoos.com returns private economic state
 * only to its owner while vendor identity and every durable mutation are checked and checkpointed.
 */

const {
	commandPayload,
	identifier
} = require('./CommandValidation.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { commandResult, queryResult } = require('./WorldCommandResult.js');

function handleEconomyRequest(context, request, room) {
	const player = room.playerFor(context.client);
	if (request.type === MESSAGE_TYPES.ECONOMY_BALANCE) {
		return queryResult(
			RESPONSE_TYPES.ECONOMY_BALANCE,
			room.economy.balance(player)
		);
	}
	if (request.type === MESSAGE_TYPES.VENDOR_BUY) {
		const payload = commandPayload(request.payload);
		return privateMutation(RESPONSE_TYPES.VENDOR_BOUGHT, room.economy.buy(
			player,
			identifier(payload.itemId, 'Item id'),
			quantity(payload.quantity),
			optionalIdentifier(payload.vendorId)
		));
	}
	if (request.type === MESSAGE_TYPES.VENDOR_SELL) {
		const payload = commandPayload(request.payload);
		return privateMutation(RESPONSE_TYPES.VENDOR_SOLD, room.economy.sell(
			player,
			identifier(payload.itemId, 'Item id'),
			quantity(payload.quantity)
		));
	}
	if (request.type === MESSAGE_TYPES.CRAFT_RECIPES) {
		return queryResult(RESPONSE_TYPES.CRAFT_RECIPES, {
			recipes: room.crafting.recipes()
		});
	}
	if (request.type === MESSAGE_TYPES.CRAFT_EXECUTE) {
		const payload = commandPayload(request.payload);
		return privateMutation(RESPONSE_TYPES.CRAFT_COMPLETED, room.crafting.craft(
			player,
			identifier(payload.recipeId, 'Recipe id'),
			quantity(payload.count)
		));
	}
	return null;
}

function privateMutation(type, payload) {
	return commandResult(type, payload, {
		broadcast: false,
		checkpoint: true
	});
}

function quantity(value) {
	const number = Number(value ?? 1);
	return Number.isSafeInteger(number) ? number : Number.NaN;
}

function optionalIdentifier(value) {
	return value == null ? null : identifier(value, 'Vendor id');
}

module.exports = {
	handleEconomyRequest
};
