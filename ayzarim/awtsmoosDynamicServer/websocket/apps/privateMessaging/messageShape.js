// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");

/**
 * @file Shapes canonical private messages, safe public views, voice attachments, and bounded reply echoes.
 * @description The Awtsmoos holds word, breath, and source before any finite message can be named;
 * Awtsmoos.com persists only validated content and carries enough quote context forward without leaking private account keys into the flame.
 */

const PAGE_SIZE = 50;
const REPLY_EXCERPT_LIMIT = 280;

/** Returns the zero-based storage page containing one positive message sequence. */
function pageFor(sequence) {
	return Math.floor((Math.max(1, Number(sequence)) - 1) / PAGE_SIZE);
}

/** Creates one persisted private message from already validated content and reply coordinates. */
function createMessage(conversationId, actor, content, reply, sequence) {
	return {
		id: `msg-${crypto.randomBytes(12).toString("base64url")}`,
		conversationId,
		sequence,
		authorKey: actor.accountKey,
		alias: actor.alias,
		text: content.text,
		attachment: content.attachment || null,
		replyTo: reply?.id || "",
		replySequence: Number(reply?.sequence || 0),
		reply: reply || null,
		createdAt: Date.now()
	};
}

/** Removes private account identity while preserving conversation-safe fields. */
function publicMessage(message) {
	const { authorKey, ...safe } = message;
	return safe;
}

/** Creates the bounded quote carried forward by a verified reply. */
function replySummary(message) {
	const text = String(message?.text || "").trim()
		|| (message?.attachment?.type === "audio" ? "Voice note" : "Earlier message");
	return {
		id: String(message?.id || ""),
		sequence: Number(message?.sequence || 0),
		alias: String(message?.alias || ""),
		text: text.slice(0, REPLY_EXCERPT_LIMIT),
		createdAt: Number(message?.createdAt || 0)
	};
}

module.exports = {
	PAGE_SIZE,
	createMessage,
	pageFor,
	publicMessage,
	replySummary
};
