// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChatRequestHandler.js
 * @description Routes scoped chat and persisted moderation through private-aware ledgers.
 * The Awtsmoos renews each word beneath the vessel that may receive it; Awtsmoos.com preserves
 * legacy speech while mute, block, history concealment, reports, and trusted review remain explicit.
 */

const {
	boundedText,
	commandPayload,
	oneOf,
	optionalIdentifier
} = require('./CommandValidation.js');
const {
	handleChatModerationRequest
} = require('./ChatModerationRequestHandler.js');
const { EVENT_TYPES, MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { commandResult, queryResult } = require('./WorldCommandResult.js');

const SCOPES = Object.freeze(['global', 'world', 'party', 'guild', 'private']);

function handleChatRequest(directory, context, request, room) {
	const player = room.playerFor(context.client);
	const moderation = handleChatModerationRequest(directory, request, room, player);
	if (moderation) return moderation;
	if (request.type === MESSAGE_TYPES.PLAYER_CHAT) {
		return sendChat(directory, context, room, player, {
			...commandPayload(request.payload),
			scope: 'world'
		}, {
			eventType: EVENT_TYPES.PLAYER_CHAT,
			responseType: RESPONSE_TYPES.PLAYER_CHAT_ACCEPTED
		});
	}
	if (request.type === MESSAGE_TYPES.CHAT_SEND) {
		const payload = commandPayload(request.payload);
		const scope = oneOf(payload.scope || 'world', SCOPES, 'Chat scope');
		return sendChat(directory, context, room, player, { ...payload, scope }, {
			eventType: scope === 'private' ? EVENT_TYPES.CHAT_PRIVATE : EVENT_TYPES.CHAT_MESSAGE,
			responseType: RESPONSE_TYPES.CHAT_SENT
		});
	}
	if (request.type === MESSAGE_TYPES.CHAT_HISTORY) {
		const payload = commandPayload(request.payload || {});
		const scope = oneOf(payload.scope || 'world', SCOPES, 'Chat scope');
		const history = directory.chat.history(
			room,
			player,
			scope,
			optionalIdentifier(payload.targetPlayerId, 'Target player id'),
			payload.limit
		);
		return queryResult(
			RESPONSE_TYPES.CHAT_HISTORY,
			directory.moderation.filterHistory(player, history)
		);
	}
	if (request.type === MESSAGE_TYPES.CHAT_CHANNELS) {
		return queryResult(RESPONSE_TYPES.CHAT_CHANNELS, directory.chat.channels(room, player));
	}
	return null;
}

function sendChat(directory, context, room, player, payload, response) {
	const delivery = directory.chat.send(directory, room, player, {
		message: boundedText(payload.message, 'Chat message', 500),
		scope: payload.scope,
		targetPlayerId: optionalIdentifier(payload.targetPlayerId, 'Target player id')
	});
	const clients = directory.moderation.filterRecipients(
		directory,
		room,
		player,
		delivery.clients
	);
	for (const client of clients) {
		context.sendEvent(client, response.eventType, delivery.message);
	}
	return commandResult(response.responseType, delivery.message, {
		broadcast: false,
		checkpoint: false
	});
}

module.exports = {
	handleChatRequest
};
