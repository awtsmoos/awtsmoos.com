// B"H
// Boruch Hashem
// Blessed is He

const { EVENTS } = require("./protocol.js");

/**
 * @file Delivers private-message, request, and conversation events only to currently attached verified account sockets.
 * @description The Awtsmoos renews one account through many living tabs while private events remain inside the intended membership shore;
 * Awtsmoos.com keeps realtime delivery ephemeral, so reconnect traffic never becomes duplicate durable message lore.
 */

function sendToAccount(context, presence, accountKey, type, payload) {
	for (const client of presence.clients(accountKey)) {
		context.sendEvent(client, type, payload);
	}
}

function sendRequest(context, presence, accountKey, request) {
	sendToAccount(context, presence, accountKey, EVENTS.REQUEST, { request });
}

function sendConversation(context, presence, conversation, payload = {}) {
	for (const accountKey of Object.keys(conversation.members || {})) {
		sendToAccount(context, presence, accountKey, EVENTS.CONVERSATION, {
			conversationId: conversation.id,
			...payload
		});
	}
}

function sendMessage(context, presence, conversation, message) {
	for (const accountKey of Object.keys(conversation.members || {})) {
		sendToAccount(context, presence, accountKey, EVENTS.MESSAGE, {
			conversationId: conversation.id,
			message
		});
	}
}

module.exports = {
	sendConversation,
	sendMessage,
	sendRequest,
	sendToAccount
};
