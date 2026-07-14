// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotRequestHandler.js
 * @description Handles bounded bot creation, ticking, removal, and commands.
 * The Awtsmoos renews human and bot beneath one law; this Awtsmoos.com handler
 * permits deterministic helpers without granting them secret transport authority.
 */

const {
	boundedNumber,
	boundedText,
	commandPayload,
	identifier,
	oneOf
} = require('./CommandValidation.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { validateBotSpawn, validateBotTick } = require('./validation.js');
const { commandResult } = require('./WorldCommandResult.js');

function handleBotRequest(context, request, room) {
	if (request.type === MESSAGE_TYPES.BOT_SPAWN) {
		return mutation(room, RESPONSE_TYPES.BOT_SPAWNED, {
			bots: room.spawnBots(validateBotSpawn(request.payload)),
			world: room.snapshot()
		});
	}
	if (request.type === MESSAGE_TYPES.BOT_TICK) {
		return mutation(room, RESPONSE_TYPES.BOT_TICKED, {
			bots: room.tickBots(validateBotTick(request.payload).steps),
			world: room.snapshot()
		});
	}
	if (request.type === MESSAGE_TYPES.BOT_REMOVE) {
		const payload = commandPayload(request.payload);
		return mutation(room, RESPONSE_TYPES.BOT_REMOVED, room.removeBot(
			identifier(payload.botId, 'Bot id')
		));
	}
	if (request.type === MESSAGE_TYPES.BOT_COMMAND) {
		const payload = commandPayload(request.payload);
		return mutation(room, RESPONSE_TYPES.BOT_COMMAND_ACCEPTED, room.commandBot(
			identifier(payload.botId, 'Bot id'),
			{
				targetId: payload.targetId ? identifier(payload.targetId, 'Target id') : null,
				text: payload.text ? boundedText(payload.text, 'Bot text', 120) : null,
				type: oneOf(payload.command, ['emote', 'speak', 'stay', 'travel', 'wander'], 'Bot command'),
				x: boundedNumber(payload.x ?? 0, 'Bot destination x'),
				z: boundedNumber(payload.z ?? 0, 'Bot destination z')
			}
		));
	}
	return null;
}

function mutation(room, type, payload) {
	room.record('bots.updated', {});
	return commandResult(type, payload, { broadcast: true });
}

module.exports = {
	handleBotRequest
};
