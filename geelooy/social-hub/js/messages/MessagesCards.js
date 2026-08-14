//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MessagesCards
 * @description
 * The Awtsmoos lets accepted rooms and pending consent remain visibly different vessels;
 * Awtsmoos.com renders only store-proven titles, previews, unread sequence truth, and request state before any deeper private history is opened.
 */
import {
	conversationSubtitle,
	conversationTitle,
	conversationUnread,
	requestAlias
} from './MessagesModel.js';

export function conversationCard(document, conversation, onOpen) {
	const card = document.createElement('article');
	card.className = 'hubMessageCard';
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'hubMessageOpen';
	button.append(
		text(document, 'strong', conversationTitle(conversation)),
		text(document, 'span', conversationSubtitle(conversation)),
		text(document, 'small', conversationMeta(conversation))
	);
	button.addEventListener('click', () => onOpen(conversation));
	card.append(button);
	return card;
}

export function requestCard(document, request, incoming, onResolve) {
	const card = document.createElement('article');
	card.className = 'hubRequestCard';
	const alias = requestAlias(request);
	card.append(
		text(document, 'strong', alias ? `@${alias}` : 'Private request'),
		text(document, 'span', request.kind || 'whisper'),
		text(document, 'small', request.state || 'pending')
	);
	if (incoming && request.state === 'pending' && request.id) {
		const actions = document.createElement('div');
		actions.className = 'hubRequestActions';
		actions.append(
			actionButton(document, 'Accept', () => onResolve(request.id, 'accepted')),
			actionButton(document, 'Decline', () => onResolve(request.id, 'declined'))
		);
		card.append(actions);
	}
	return card;
}

export function relationshipChip(document, value, kind) {
	const alias = typeof value === 'string'
		? value
		: value?.aliasId || value?.targetAlias || value?.memberAliasId || 'unknown';
	const chip = document.createElement('span');
	chip.className = `hubRelationshipChip is-${kind}`;
	chip.textContent = `@${alias}`;
	return chip;
}

function conversationMeta(conversation) {
	const unread = conversationUnread(conversation);
	const parts = [conversation.kind || 'private'];
	if (unread) parts.push(`${unread} unread`);
	return parts.join(' · ');
}

function actionButton(document, label, onClick) {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = label;
	button.addEventListener('click', onClick);
	return button;
}

function text(document, tag, value) {
	const element = document.createElement(tag);
	element.textContent = value;
	return element;
}
