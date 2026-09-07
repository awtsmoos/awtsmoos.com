// B"H
// Boruch Hashem
// Blessed is He

import { createClientIntentId } from "./MessagingClientIntent.js";

/**
 * @file Shapes immutable text and voice intentions before they enter durable browser storage.
 * @description The Awtsmoos knows one human intention before reload, retry, or upload can divide its appearances; Awtsmoos.com names that intention once,
 * preserving room, alias, reply, words, and recorded breath so later transport may repeat its attempt without rewriting what the person meant in light.
 */

/** Creates one durable text-send intention. */
export function createTextOutboxIntent(input, now = Date.now()) {
	return baseIntent("text", input, now, {
		text: String(input.text || ""),
		file: null,
		assetId: ""
	});
}

/** Creates one durable voice-send intention whose File may be structured-cloned by IndexedDB. */
export function createVoiceOutboxIntent(input, now = Date.now()) {
	if (!input.file) throw new Error("A recorded voice file is required for offline delivery.");
	return baseIntent("voice", input, now, {
		text: "",
		file: input.file,
		assetId: String(input.assetId || "")
	});
}

function baseIntent(kind, input, now, payload) {
	const conversationId = String(input.conversationId || "").trim();
	const aliasId = String(input.aliasId || "").trim();
	if (!conversationId) throw new Error("A conversation is required for message delivery.");
	if (!aliasId) throw new Error("An active alias is required for message delivery.");
	const clientIntentId = input.clientIntentId || createClientIntentId();
	return {
		id: clientIntentId,
		clientIntentId,
		kind,
		conversationId,
		aliasId,
		reply: normalizeReply(input.reply),
		...payload,
		state: "queued",
		attempts: 0,
		nextAttemptAt: Number(now),
		createdAt: Number(now),
		updatedAt: Number(now),
		lastError: null
	};
}

function normalizeReply(reply) {
	if (!reply?.replyTo || !Number(reply?.replySequence)) return null;
	return {
		replyTo: String(reply.replyTo),
		replySequence: Number(reply.replySequence)
	};
}
