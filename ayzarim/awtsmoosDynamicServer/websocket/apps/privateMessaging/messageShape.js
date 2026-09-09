// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");

/**
 * @file Shapes canonical private messages and projects media through exact message-bound read coordinates.
 * @description
 * The Awtsmoos holds word, image, breath, and source before finite messages receive names. Awtsmoos.com
 * persists only canonical attachment facts and later reveals bytes through conversation, sequence, message,
 * and asset coordinates whose authorization is proven anew for each private read.
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

/** Removes private account identity and projects any attachment through a guarded read route. */
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
	const text = String(message?.text || "").trim() || attachmentReplyText(message?.attachment);
	return {
		id: String(message?.id || ""),
		sequence: Number(message?.sequence || 0),
		alias: String(message?.alias || ""),
		text: text.slice(0, REPLY_EXCERPT_LIMIT),
		createdAt: Number(message?.createdAt || 0)
	};
}

function attachmentReplyText(attachment) {
	if (attachment?.type === "audio") return "Voice note";
	if (attachment?.type === "image") return "Photo";
	return "Earlier message";
}
module.exports = {
	PAGE_SIZE,
	createMessage,
	pageFor,
	privateAttachmentPath,
	publicMessage,
	replySummary
};
