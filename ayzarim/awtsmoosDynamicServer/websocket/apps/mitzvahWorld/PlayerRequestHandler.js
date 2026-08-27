// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerRequestHandler.js
 * @description Routes authoritative movement, action, profile, inventory, and equipment.
 * The Awtsmoos renews expression and possession without client sovereignty;
 * Awtsmoos.com validates each request before revealing a bounded world mutation.
 */

const {
	boundedText,
	commandPayload,
	identifier
} = require('./CommandValidation.js');
const {
	handlePlayerEquipmentRequest
} = require('./PlayerEquipmentRequest.js');
const {
	handlePlayerProfileRequest
} = require('./PlayerProfileRequest.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { validateInput } = require('./validation.js');
const {
	commandResult,
	queryResult
} = require('./WorldCommandResult.js');

function handlePlayerRequest(directory, context, request, room) {
	const player = room.playerFor(context.client);
	if (request.type === MESSAGE_TYPES.PLAYER_INPUT) {
		return mutation(room, RESPONSE_TYPES.INPUT_ACCEPTED, {
			player: room.move(context.client, validateInput(request.payload)),
			world: room.snapshot()
		});
	}
	if (request.type === MESSAGE_TYPES.PLAYER_ACTION) {
		const payload = commandPayload(request.payload);
		return mutation(room, RESPONSE_TYPES.PLAYER_ACTION_ACCEPTED, {
			player: room.playerActions.action(
				player,
				boundedText(payload.action, 'Action', 32)
			)
		});
	}
	if (request.type === MESSAGE_TYPES.PLAYER_INTERACT) {
		return interaction(room, player, request.payload);
	}
	if (request.type === MESSAGE_TYPES.PLAYER_EMOTE) {
		const payload = commandPayload(request.payload);
		return mutation(room, RESPONSE_TYPES.PLAYER_EMOTE_ACCEPTED, {
			player: room.playerActions.emote(
				player,
				boundedText(payload.emote, 'Emote', 32)
			)
		});
	}
	if (request.type === MESSAGE_TYPES.PLAYER_RESPAWN) {
		return mutation(room, RESPONSE_TYPES.PLAYER_RESPAWNED, {
			player: room.playerActions.respawn(player)
		});
	}
	if (request.type === MESSAGE_TYPES.PLAYER_PROFILE) {
		return handlePlayerProfileRequest(room, player, request.payload);
	}
	if (request.type === MESSAGE_TYPES.PLAYER_INVENTORY) {
		return queryResult(
			RESPONSE_TYPES.PLAYER_INVENTORY,
			room.inventory.snapshot(player)
		);
	}
	if (request.type === MESSAGE_TYPES.PLAYER_EQUIPMENT) {
		return handlePlayerEquipmentRequest(room, player, request.payload);
	}
	return null;
}

function interaction(room, player, rawPayload) {
	const payload = commandPayload(rawPayload);
	return queryResult(
		RESPONSE_TYPES.PLAYER_INTERACTION,
		room.playerActions.interact(
			player,
			identifier(payload.targetId, 'Target id'),
			boundedText(
				payload.action || 'interact',
				'Interaction action',
				32
			)
		)
	);
}

function mutation(room, type, payload) {
	room.record('player.updated', {
		playerId: payload.player?.id || null
	});
	return commandResult(type, payload, {
		broadcast: true
	});
}

module.exports = {
	handlePlayerRequest
};
