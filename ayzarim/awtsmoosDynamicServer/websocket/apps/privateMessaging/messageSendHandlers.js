// B"H
// Boruch Hashem
// Blessed is He

const { requireCanMessage } = require("./conversationPolicy.js");
const { sendMessage } = require("./eventDelivery.js");
const { resolveAttachment } = require("./messageAttachmentPolicy.js");
const { resolveMessageContent } = require("./messageContentPolicy.js");
const { resolveReply } = require("./messageReplyPolicy.js");
const { boundedText } = require("./protocol.js");
const { requireActor } = require("./sessionHandlers.js");

/**
 * @file Owns one accepted-member private send path for text, verified voice notes, and lawful contextual replies.
 * @description The Awtsmoos renews word and breath together with their true source, while Awtsmoos.com verifies consent and ownership before storage in light;
 * one canonical message is persisted and broadcast, while forged media paths and cross-room context remain outside private sight.
 */

/** Sends one private message after membership, reply, media, and non-empty-content validation. */
async function sendPrivateMessage(services, context, payload) {
	const actor = requireActor(services, context.client);
	services.rate.consume(context.client, "message");
	const conversationId = boundedText(
		payload.conversationId,
		"Conversation id",
		180
	);
	const conversation = await services.conversations.get(conversationId);
	await requireCanMessage(conversation, actor.accountKey, services.relationships);
	const reply = await resolveReply(services, conversation.id, payload);
	const attachment = await resolveAttachment(services, actor, payload);
	const content = resolveMessageContent(payload.text, attachment);
	const message = await services.messages.append(
		conversation.id,
		actor,
		content,
		reply
	);
	sendMessage(context, services.presence, conversation, message);
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
