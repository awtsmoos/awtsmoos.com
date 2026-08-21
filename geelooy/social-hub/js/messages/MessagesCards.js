//B"H
//Boruch Hashem
//Blessed is He

import {
	conversationSubtitle,
	conversationTitle,
	conversationUnread,
	requestAlias
} from './MessagesModel.js';
import { requestActionRegion } from './MessagesRequestActions.js';

/**
 * @module MessagesCards
 * @description
 * The Awtsmoos is beyond accepted room, pending consent, friendship, and block, while Awtsmoos.com lets each proven relationship speak in human order;
 * these Hod-like cards place identity and next action before protocol jargon, while request mutation state remains in its own Gevurah vessel of light.
 */

/** Builds one accepted-room card with explicit unread truth and a large touchable open action. */
export function conversationCard(document, conversation, onOpen) {
	const unread = conversationUnread(conversation);
	const card = document.createElement('article');
	card.className = 'hubMessageCard';
	card.dataset.unread = String(unread > 0);
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'hubMessageOpen';
	button.append(
		text(document, 'strong', conversationTitle(conversation), 'hubMessageCard__title'),
		text(document, 'span', conversationSubtitle(conversation), 'hubMessageCard__preview'),
		conversationMeta(document, conversation, unread)
	);
	button.addEventListener('click', () => onOpen(conversation));
	card.append(button);
	return card;
}

/** Builds an incoming or outgoing consent request with truthful next-action language. */
export function requestCard(document, request, incoming, onResolve) {
	const alias = requestAlias(request);
	const card = document.createElement('article');
	card.className = 'hubRequestCard';
	card.dataset.direction = incoming ? 'incoming' : 'outgoing';
	card.append(
		text(document, 'strong', requestTitle(alias, incoming), 'hubRequestCard__title'),
		text(document, 'span', requestMeaning(request, incoming), 'hubRequestCard__meaning'),
		text(document, 'small', requestState(request, incoming), 'hubRequestCard__state')
	);
	if (incoming && request.state === 'pending' && request.id) {
		card.append(requestActionRegion(document, request.id, onResolve));
	}
	return card;
}

/** Builds one compact relationship identity chip from canonical alias evidence. */
export function relationshipChip(document, value, kind) {
	const alias = typeof value === 'string'
		? value
		: value?.aliasId || value?.targetAlias || value?.memberAliasId || 'unknown';
	const chip = document.createElement('span');
	chip.className = `hubRelationshipChip is-${kind}`;
	chip.textContent = `@${alias}`;
	return chip;
}

function conversationMeta(document, conversation, unread) {
	const meta = document.createElement('small');
	meta.className = 'hubMessageCard__meta';
	const kind = conversation.kind === 'group' ? 'Group' : 'Private';
	meta.append(text(document, 'span', kind));
	if (unread) {
		const badge = text(document, 'strong', `${unread} unread`, 'hubMessageUnread');
		badge.setAttribute('aria-label', `${unread} unread messages`);
		meta.append(badge);
	}
	return meta;
}

function requestTitle(alias, incoming) {
	const identity = alias ? `@${alias}` : 'Another alias';
	return incoming ? `Request from ${identity}` : `Request sent to ${identity}`;
}

function requestMeaning(request, incoming) {
	const kind = String(request?.kind || 'private').replace(/[-_]/g, ' ');
	return incoming ? `${kind} conversation invitation` : `${kind} conversation request`;
}

function requestState(request, incoming) {
	if (request?.state !== 'pending') return String(request?.state || 'resolved');
	return incoming ? 'Your consent is required' : 'Waiting for their response';
}

function text(document, tag, value, className = '') {
	const element = document.createElement(tag);
	element.textContent = value;
	if (className) element.className = className;
	return element;
}
