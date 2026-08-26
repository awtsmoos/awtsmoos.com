//B"H
//Boruch Hashem
//Blessed is He

import { ConversationVoicePlayer } from './ConversationVoicePlayer.js';

/**
 * @module ConversationMessageParts
 * @description
 * The Awtsmoos is beyond speaker, clock, quote, and audible breath, while Awtsmoos.com lets each canonical private-message field enter one small Social vessel;
 * these Hod-like helpers render only server/store truth and know nothing of sockets, gestures, paging, or composer state in light.
 */

/** Returns the human speaker label relative to the active canonical actor alias. */
export function conversationSpeaker(message, actorAlias = '') {
	return message?.alias === actorAlias ? 'You' : String(message?.alias || 'Alias');
}

/** Creates sender and timestamp metadata without fabricating missing time. */
export function conversationMessageHeader(document, message, actorAlias = '') {
	const header = document.createElement('header');
	header.className = 'hubConversationMessage__header';
	const speaker = document.createElement('strong');
	speaker.textContent = conversationSpeaker(message, actorAlias);
	header.append(speaker);
	const timestamp = parseDate(message?.createdAt);
	if (timestamp) {
		const time = document.createElement('time');
		time.dateTime = timestamp.toISOString();
		time.textContent = timestamp.toLocaleTimeString([], {
			hour: 'numeric',
			minute: '2-digit'
		});
		header.append(time);
	}
	return header;
}

/** Creates a direction-aware body or an empty fragment for voice-only messages. */
export function conversationMessageBody(document, text) {
	if (!String(text || '').trim()) return document.createDocumentFragment();
	const body = document.createElement('p');
	body.className = 'hubConversationMessage__body';
	body.dir = 'auto';
	body.textContent = String(text);
	return body;
}

/** Creates the server-bounded reply preview, including stable jump coordinates when available. */
export function conversationReplyPreview(document, message, actorAlias = '') {
	if (!message?.reply && !message?.replyTo) return document.createDocumentFragment();
	const preview = document.createElement(message?.reply ? 'button' : 'div');
	preview.className = 'hubConversationReplyPreview';
	if (!message.reply) {
		preview.classList.add('is-unavailable');
		preview.textContent = 'Earlier message';
		return preview;
	}
	preview.type = 'button';
	preview.dataset.replyJump = 'true';
	preview.dataset.replyId = String(message.reply.id || '');
	preview.dataset.replySequence = String(message.reply.sequence || '');
	const speaker = document.createElement('strong');
	speaker.textContent = message.reply.alias === actorAlias ? 'You' : String(message.reply.alias || 'Sender');
	const text = document.createElement('span');
	text.dir = 'auto';
	text.textContent = String(message.reply.text || 'Earlier message');
	preview.append(speaker, text);
	return preview;
}

/** Creates fully owned custom playback from the server-derived trusted attachment path. */
export function conversationAudio(document, attachment) {
	if (attachment?.type !== 'audio' || !attachment?.publicPath) {
		return document.createDocumentFragment();
	}
	const player = new ConversationVoicePlayer(document, { label: 'Voice note' });
	player.element.classList.add('hubConversationVoiceMessage');
	player.setSource(attachment.publicPath);
	return player.element;
}

/** Creates explicit Reply parity for keyboard and touch users. */
export function conversationReplyAction(document, speaker) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'hubConversationReplyAction';
	button.dataset.messageReply = 'true';
	button.setAttribute('aria-label', `Reply to ${speaker}`);
	button.textContent = '↩ Reply';
	return button;
}

/** Safely parses canonical timestamps without inventing invalid dates. */
function parseDate(value) {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}
