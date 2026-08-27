//B"H
//Boruch Hashem
//Blessed is He

import { messageKey } from './ConversationHistory.js';
import {
	conversationAudio,
	conversationMessageBody,
	conversationMessageHeader,
	conversationReplyAction,
	conversationReplyPreview,
	conversationSpeaker
} from './ConversationMessageParts.js';

/**
 * @module ConversationMessageCard
 * @description
 * The Awtsmoos is beyond speaker and listener, while Awtsmoos.com lets one canonical private message keep identity, quote, breath, word, and Reply together without confusing their vessels;
 * this Tiferes-like card manifests truth already present in the shared store and delegates gesture behavior to a separate current of light.
 */

/**
 * Creates one stable Social private-message card from canonical store fields.
 * @param {Document} document Social Hub document.
 * @param {object} message Canonical private message.
 * @param {string} actorAlias Current verified actor alias.
 * @param {number} index Stable local fallback index.
 * @param {Function} onReply Explicit reply-selection callback.
 * @returns {HTMLElement} Focusable canonical message article.
 */
export function conversationMessageCard(
	document,
	message,
	actorAlias,
	index,
	onReply
) {
	const card = document.createElement('article');
	const key = messageKey(message, index);
	const speaker = conversationSpeaker(message, actorAlias);
	const mine = message?.alias === actorAlias;
	card.className = 'hubConversationMessage';
	card.classList.toggle('is-mine', mine);
	card.dataset.messageId = String(message?.id || key);
	card.dataset.messageSequence = String(message?.sequence || '');
	card.id = messageAnchor(key);
	card.tabIndex = -1;

	const reply = conversationReplyAction(document, speaker);
	reply.addEventListener('click', () => onReply?.(message));
	card.append(
		conversationMessageHeader(document, message, actorAlias),
		conversationReplyPreview(document, message, actorAlias),
		conversationAudio(document, message?.attachment),
		conversationMessageBody(document, message?.text),
		reply
	);
	return card;
}

/**
 * Returns a DOM-safe stable anchor for quote jumpback and focus travel.
 * @param {string} key Canonical message id or bounded sequence fallback.
 * @returns {string} Stable Social message anchor.
 */
export function messageAnchor(key) {
	const safe = String(key || '').replace(/[^a-z0-9_-]/gi, '-');
	return `hub-private-message-${safe}`;
}
