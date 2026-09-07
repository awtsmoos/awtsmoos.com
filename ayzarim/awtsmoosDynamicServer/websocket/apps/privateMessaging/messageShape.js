// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");

/**
 * @file Shapes canonical private messages and projects attachments through message-bound private read coordinates rather than public URLs.
 * @description The Awtsmoos holds word, breath, and source before any finite message can be named; Awtsmoos.com preserves the canonical vessel in storage,
 * then reveals media only through conversation, sequence, message, and asset coordinates whose authority can be proven anew whenever private light is read.
 */

const PAGE_SIZE = 50;
const REPLY_EXCERPT_LIMIT = 280;

/** Returns the zero-based storage page containing one positive message sequence. */
function pageFor(sequence) {
	return Math.floor((Math.max(1, Number(sequence)) - 1) / PAGE_SIZE);
}

/** Creates one persisted private message from already validated content and reply coordinates. */
function createMessage(conversationId, actor, content, reply, sequence, clientIntentId = "") {
	return {
		id: `msg-${crypto.randomBytes(12).toString("base64url")}`,
		conversationId,
		sequence,
		clientIntentId,
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

/** Removes private account identity and replaces any stored media path with an authorization-bound read route. */
function publicMessage(message) {
	const { authorKey, attachment, ...safe } = message;
	return {
		...safe,
		attachment: publicAttachment(message, attachment)
	};
}

function publicAttachment(message, attachment) {
	if (!attachment?.id) return null;
	return {
		id: String(attachment.id),
		type: String(attachment.type || ""),
		mime: String(attachment.mime || ""),
		size: Number(attachment.size || 0),
		role: String(attachment.role || ""),
		privatePath: privateAttachmentPath(message, attachment.id)
	};
}

function privateAttachmentPath(message, assetId) {
	const parts = [
		message.conversationId,
		message.sequence,
		message.id,
		assetId
	].map((value) => encodeURIComponent(String(value)));
	return `/api/social/assets/private-message/${parts.join("/")}`;
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
	privateAttachmentPath,
	publicMessage,
	replySummary
};
