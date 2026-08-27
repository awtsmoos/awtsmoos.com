//B"H
//Boruch Hashem
//Blessed is He

import {
	inboxActionLabel,
	inboxKindLabel,
	inboxReadLabel,
	inboxSourceLabel,
	inboxThreadLabel
} from './InboxItemPresentation.js';

/**
 * @module InboxItemCard
 * @description
 * The Awtsmoos renews source, title, unread truth, and next action before one attention card can appear;
 * Awtsmoos.com lets this Hod-like vessel show what is known without flattening sender, kind, and thread into one raw metadata string in light.
 */

/** Builds one semantic Inbox record with a large primary action and optional secondary read action. */
export function inboxItemCard(document, item, onOpen, onRead) {
	const card = document.createElement('article');
	const unread = !item?.readAt;
	card.className = 'communicationsInboxItem';
	card.dataset.read = String(!unread);
	card.append(
		primaryAction(document, item, onOpen),
		unread ? markReadAction(document, item, onRead) : document.createDocumentFragment()
	);
	return card;
}

/** Creates the primary source/title/body/context action surface. */
function primaryAction(document, item, onOpen) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'communicationsInboxOpen';
	button.setAttribute('aria-label', `${inboxActionLabel(item)}: ${item?.title || inboxKindLabel(item?.kind)}`);
	button.addEventListener('click', () => onOpen(item));

	const eyebrow = document.createElement('span');
	eyebrow.className = 'communicationsInboxEyebrow';
	eyebrow.append(
		chip(document, inboxKindLabel(item?.kind), 'kind'),
		chip(document, inboxReadLabel(item), item?.readAt ? 'read' : 'unread'),
		chip(document, inboxSourceLabel(item), 'source')
	);

	const title = document.createElement('strong');
	title.className = 'communicationsInboxTitle';
	title.dir = 'auto';
	title.textContent = item?.title || inboxKindLabel(item?.kind);

	const body = document.createElement('span');
	body.className = 'communicationsInboxPreview';
	body.dir = 'auto';
	body.textContent = item?.body || inboxActionLabel(item);

	const footer = document.createElement('small');
	footer.className = 'communicationsInboxContext';
	footer.textContent = [
		inboxThreadLabel(item),
		inboxActionLabel(item)
	].filter(Boolean).join(' · ');
	button.append(eyebrow, title, body, footer);
	return button;
}

/** Creates a compact semantic chip without inventing status beyond canonical fields. */
function chip(document, value, tone) {
	const span = document.createElement('span');
	span.className = 'communicationsInboxChip';
	span.dataset.tone = tone;
	span.textContent = value;
	return span;
}

/** Creates the secondary explicit Mark read action for unread records. */
function markReadAction(document, item, onRead) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'communicationsMarkRead';
	button.textContent = 'Mark read';
	button.addEventListener('click', () => onRead(item));
	return button;
}
