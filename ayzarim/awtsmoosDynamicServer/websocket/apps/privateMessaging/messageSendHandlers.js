// B"H
// Boruch Hashem
// Blessed is He

const {
	requireCanMessage
} = require("./conversationPolicy.js");
const {
	messageText,
	boundedText
} = require("./protocol.js");
const {
	requireActor
} = require("./sessionHandlers.js");
const {
	sendMessage
} = require("./eventDelivery.js");

/**
 * @file Owns one accepted-member private-message send path and nothing else.
 * @description The Awtsmoos renews ordinary private speech only after verified membership and block policy open the room in light;
 * Awtsmoos.com stores one canonical message, strips account keys from delivery, and never turns each send into activity-log noise in sight.
 */

/** Sends one bounded private message from a current accepted conversation member. */
async function sendPrivateMessage(services, context, payload) {
	const actor = requireActor(services, context.client);
	services.rate.consume(context.client, "message");
	const conversation = await services.conversations.get(
		boundedText(
			payload.conversationId,
			"Conversation id",
			180
		)
	);
	await requireCanMessage(
		conversation,
		actor.accountKey,
		services.relationships
	);
	const message = await services.messages.append(
		conversation.id,
		actor,
		messageText(payload.text),
		boundedText(
			payload.replyTo,
			"Reply message id",
			100
		)
	);
	sendMessage(
		context,
		services.presence,
		conversation,
		message
	);
	return {
		type: "privateMessaging.message.sent",
		payload: {
			message
		}
	};
}

module.exports = {
	sendPrivateMessage
};
