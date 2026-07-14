// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerRequestHandler.js
 * @description Handles authoritative player action, social, profile, and item commands.
 * The Awtsmoos renews expression and possession without client sovereignty;
 * Awtsmoos.com validates each request before revealing a bounded world mutation.
 */

const {
	boundedText,
	commandPayload,
	identifier,
	oneOf,
	optionalIdentifier
} = require('./CommandValidation.js');
const { EVENT_TYPES, MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { validateInput } = require('./validation.js');
const { commandResult, queryResult } = require('./WorldCommandResult.js');

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
			player: room.playerActions.action(player, boundedText(payload.action, 'Action', 32))
		});
	}
	if (request.type === MESSAGE_TYPES.PLAYER_INTERACT) {
		const payload = commandPayload(request.payload);
		return queryResult(RESPONSE_TYPES.PLAYER_INTERACTION, room.playerActions.interact(
			player,
			identifier(payload.targetId, 'Target id'),
			boundedText(payload.action || 'interact', 'Interaction action', 32)
		));
	}
	if (request.type === MESSAGE_TYPES.PLAYER_CHAT) {
		return chat(directory, context, room, player, request.payload);
	}
	if (request.type === MESSAGE_TYPES.PLAYER_EMOTE) {
		const payload = commandPayload(request.payload);
		return mutation(room, RESPONSE_TYPES.PLAYER_EMOTE_ACCEPTED, {
			player: room.playerActions.emote(player, boundedText(payload.emote, 'Emote', 32))
		});
	}
	if (request.type === MESSAGE_TYPES.PLAYER_RESPAWN) {
		return mutation(room, RESPONSE_TYPES.PLAYER_RESPAWNED, {
			player: room.playerActions.respawn(player)
		});
	}
	if (request.type === MESSAGE_TYPES.PLAYER_PROFILE) {
		return profile(room, player, request.payload);
	}
	if (request.type === MESSAGE_TYPES.PLAYER_INVENTORY) {
		return queryResult(RESPONSE_TYPES.PLAYER_INVENTORY, room.inventory.snapshot(player));
	}
	if (request.type === MESSAGE_TYPES.PLAYER_EQUIPMENT) {
		return equipment(room, player, request.payload);
	}
	return null;
}

function chat(directory, context, room, player, rawPayload) {
	const payload = commandPayload(rawPayload);
	const message = {
		from: { displayName: player.displayName, id: player.id },
		message: boundedText(payload.message, 'Chat message', 280),
		sentAt: directory.sessions.clock()
	};
	for (const client of room.clients()) context.sendEvent(client, EVENT_TYPES.PLAYER_CHAT, message);
	return commandResult(RESPONSE_TYPES.PLAYER_CHAT_ACCEPTED, message, { checkpoint: false });
}

function profile(room, player, rawPayload) {
	const payload = commandPayload(rawPayload || {});
	const operation = oneOf(payload.operation || 'get', ['get', 'update'], 'Profile operation');
	const update = operation === 'update'
		? { status: boundedText(payload.status, 'Status', 16) }
		: null;
	const result = room.playerActions.profile(player, update);
	return operation === 'get'
		? queryResult(RESPONSE_TYPES.PLAYER_PROFILE, result)
		: mutation(room, RESPONSE_TYPES.PLAYER_PROFILE, result);
}

function equipment(room, player, rawPayload) {
	const payload = commandPayload(rawPayload || {});
	const operation = oneOf(payload.operation || 'snapshot', ['equip', 'snapshot', 'unequip'], 'Equipment operation');
	if (operation === 'snapshot') {
		return queryResult(RESPONSE_TYPES.PLAYER_EQUIPMENT, room.inventory.snapshot(player));
	}
	const slot = optionalIdentifier(payload.slot, 'Equipment slot');
	const result = operation === 'equip'
		? room.inventory.equip(player, identifier(payload.itemId, 'Item id'), slot)
		: room.inventory.unequip(player, identifier(payload.slot, 'Equipment slot'));
	return mutation(room, RESPONSE_TYPES.PLAYER_EQUIPMENT, result);
}

function mutation(room, type, payload) {
	room.record('player.updated', { playerId: payload.player?.id || null });
	return commandResult(type, payload, { broadcast: true });
}

module.exports = {
	handlePlayerRequest
};
