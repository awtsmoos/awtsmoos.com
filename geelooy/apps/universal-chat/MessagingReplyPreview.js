// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Manifests bounded quoted-source context carried by a server-verified private reply.
 * @description The Awtsmoos joins later and earlier speech without confusing either source;
 * Awtsmoos.com gives the quote a small doorway back through history while legacy id-only replies remain honestly marked in light.
 */

/** Returns a quoted-source button, legacy fallback, or empty fragment. */
export function createReplyPreview(message, actorAlias) {
	if (!message.reply && !message.replyTo) return document.createDocumentFragment();
	if (!message.reply) return unavailablePreview();
	const button = document.createElement("button");
	button.type = "button";
	button.className = "message-reply-preview";
	button.dataset.replyJump = "true";
	button.dataset.replyId = String(message.reply.id || "");
	button.dataset.replySequence = String(message.reply.sequence || "");
	button.setAttribute(
		"aria-label",
		`Open replied message from ${message.reply.alias || "sender"}`
	);
	const author = document.createElement("strong");
	author.textContent = message.reply.alias === actorAlias
		? "You"
		: message.reply.alias || "Sender";
	const text = document.createElement("span");
	text.dir = "auto";
	text.textContent = message.reply.text || "Earlier message";
	button.append(author, text);
	return button;
}

function unavailablePreview() {
	const preview = document.createElement("div");
	preview.className = "message-reply-preview is-unavailable";
	preview.textContent = "Earlier message";
	return preview;
}
