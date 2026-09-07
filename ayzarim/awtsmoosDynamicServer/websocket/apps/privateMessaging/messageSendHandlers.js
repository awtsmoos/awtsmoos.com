// B"H
// Boruch Hashem
// Blessed is He

const { requireCanMessage } = require("./conversationPolicy.js");
const { sendMessage } = require("./eventDelivery.js");
const { resolveAttachment } = require("./messageAttachmentPolicy.js");
const { resolveMessageContent } = require("./messageContentPolicy.js");
const { resolveClientIntentId } = require("./messageIntentPolicy.js");
const { resolveReply } = require("./messageReplyPolicy.js");
const { boundedText } = require("./protocol.js");
const { requireActor } = require("./sessionHandlers.js");

/**
 * @file Owns one accepted-member private send and broadcasts only when this request actually created the canonical message.
 * @description The Awtsmoos is one through retry and return; Awtsmoos.com verifies consent, reply, media, and client intention before storage in light,
 * then a duplicate response reveals the already-written vessel quietly instead of rebroadcasting the same finite spark twice in sight.
 */

async function sendPrivateMessage(services, context, payload) {
	const actor = requireActor(services, context.client);
	services.rate.consume(context.client, "message");
	const conversationId = boundedText(
		payload.conversationId,
		"Conversation id",
		180
	);
	const clientIntentId = resolveClientIntentId(payload.clientIntentId);
	const conversation = await services.conversations.get(conversationId);
	await requireCanMessage(conversation, actor.accountKey, services.relationships);
	const reply = await resolveReply(services, conversation.id, payload);
	const attachment = await resolveAttachment(services, actor, payload);
	const content = resolveMessageContent(payload.text, attachment);
	const outcome = await services.messages.append(
		conversation.id,
		actor,
		content,
		reply,
		clientIntentId
	);
	if (!outcome?.message) {
		throw new Error("Canonical private message could not be stored.");
	}
	if (!outcome.duplicate) {
		sendMessage(context, services.presence, conversation, outcome.message);
	}
	return {
		type: "privateMessaging.message.sent",
		payload: {
			message: outcome.message
		}
	};
}

module.exports = {
	sendPrivateMessage
};
