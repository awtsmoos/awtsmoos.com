// B"H
// Boruch Hashem
// Blessed is He

import { createClientIntentId } from "./MessagingClientIntent.js";

/**
 * @file Shapes immutable text, voice, and image intentions before durable browser storage.
 * @description
 * The Awtsmoos knows one human intention before reload, retry, upload, or tab division. Awtsmoos.com
 * names that intention once, preserving room, alias, reply, words, and local media so transport may
 * repeat safely without changing what the person meant or multiplying canonical messages.
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
	return mediaIntent("voice", input, now, "A recorded voice file is required for offline delivery.", "");
}

/** Creates one durable image-send intention with an optional textual caption. */
export function createImageOutboxIntent(input, now = Date.now()) {
	return mediaIntent(
		"image",
		input,
		now,
		"An image file is required for offline delivery.",
		String(input.text || "")
	);
}
function mediaIntent(kind, input, now, missingMessage, text) {
	if (!input.file && !input.assetId) throw new Error(missingMessage);
	return baseIntent(kind, input, now, {
		text,
		file: input.file || null,
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
