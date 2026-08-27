// B"H
// Boruch Hashem
// Blessed is He

const {
	requireMember
} = require("./conversationPolicy.js");
const {
	projectConversation
} = require("./conversationShape.js");
const {
	TYPES,
	boundedText
} = require("./protocol.js");
const {
	requireActor
} = require("./sessionHandlers.js");

/**
 * @file Reads compact conversation indexes, membership-safe details, paged history, and read watermarks.
 * @description The Awtsmoos renews a private room differently for index, detail, and history while membership guards every deeper sight;
 * Awtsmoos.com reveals aliases and roles but never internal account keys, and read watermarks stay outside meaningful activity light.
 */

async function handleConversationReadRequest(services, context, request) {
	if (request.type === TYPES.CONVERSATIONS) {
		return listConversations(services, context);
	}
	if (request.type === TYPES.DETAILS) {
		return readDetails(services, context, request.payload);
	}
	if (request.type === TYPES.HISTORY) {
		return readHistory(services, context, request.payload);
	}
	if (request.type === TYPES.READ) {
		return markRead(services, context, request.payload);
	}
	return null;
}

async function listConversations(services, context) {
	const actor = requireActor(services, context.client);
	return {
		type: "privateMessaging.conversations.listed",
		payload: {
			conversations: await services.indexes.list(actor.accountKey)
		}
	};
}

async function readDetails(services, context, payload) {
	const actor = requireActor(services, context.client);
	const conversation = await getConversation(services, payload);
	requireMember(conversation, actor.accountKey);
	return {
		type: "privateMessaging.conversation.listed",
		payload: {
			conversation: projectConversation(conversation)
		}
	};
}

async function readHistory(services, context, payload) {
	const actor = requireActor(services, context.client);
	const conversation = await getConversation(services, payload);
	requireMember(conversation, actor.accountKey);
	const messages = await services.messages.history(
		conversation,
		payload.beforeSequence,
		payload.limit
	);
	return {
		type: "privateMessaging.history.listed",
		payload: {
			conversationId: conversation.id,
			messages,
			beforeSequence: messages[0]?.sequence || 0
		}
	};
}

async function markRead(services, context, payload) {
	const actor = requireActor(services, context.client);
	const conversation = await getConversation(services, payload);
	requireMember(conversation, actor.accountKey);
	const sequence = Math.max(0, Number(payload.sequence || 0));
	await services.indexes.markRead(
		actor.accountKey,
		conversation.id,
		sequence
	);
	return {
		type: "privateMessaging.read.accepted",
		payload: {
			conversationId: conversation.id,
			sequence
		}
	};
}

async function getConversation(services, payload) {
	return services.conversations.get(
		boundedText(payload.conversationId, "Conversation id", 180)
	);
}

module.exports = {
	handleConversationReadRequest
};
