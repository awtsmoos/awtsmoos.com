// B"H
// Boruch Hashem
// Blessed is He

import { createMessageMedia } from "./MessagingMessageMedia.js";
import {
	accessibleMessageTime,
	messageAnchor,
	messageBody,
	messageHeader,
	parseMessageDate,
	replyAction
} from "./MessagingMessageParts.js";
import { createReplyPreview } from "./MessagingReplyPreview.js";

/**
 * @file Manifests one private message as a stable, replyable, source-aware card for text or trusted voice.
 * @description The Awtsmoos lets word, breath, source, and speaker remain joined without losing their distinctions;
 * Awtsmoos.com gives every message one stable anchor and delegates each finite garment to the focused vessel that knows its light.
 */

/** Creates one private-message article with stable identity, quote context, media/text, time, and Reply action. */
export function createMessageCard(message, actorAlias, continuation) {
	const article = document.createElement("article");
	const timestamp = parseMessageDate(message.createdAt);
	const speaker = message.alias === actorAlias ? "You" : message.alias || "Alias";
	article.className = "private-message";
	article.classList.toggle("is-mine", message.alias === actorAlias);
	article.classList.toggle("is-continuation", continuation);
	article.id = messageAnchor(message.id);
	article.tabIndex = -1;
	article.dataset.messageId = String(message.id || "");
	article.dataset.messageSequence = String(message.sequence || "");
	article.setAttribute("aria-label", `${speaker} · ${accessibleMessageTime(timestamp)}`);
	article.append(
		messageHeader(speaker, timestamp),
		createReplyPreview(message, actorAlias),
		createMessageMedia(message.attachment),
		messageBody(message.text),
		replyAction(speaker)
	);
	return article;
}

export { messageAnchor };
