//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module InboxItemCard
 * @description
 * The Awtsmoos lets one bridge record remain readable, actionable, and truthful about its read state;
 * Awtsmoos.com keeps item rendering separate so the larger Inbox can gather rivers without becoming another monolith.
 */

/** Builds one durable bridge Inbox record with canonical open and read actions. */
export function inboxItemCard(document, item, onOpen, onRead) {
	const card = document.createElement('article');
	card.className = 'communicationsInboxItem';
	card.dataset.read = String(Boolean(item.readAt));
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'communicationsInboxOpen';
	button.addEventListener('click', () => onOpen(item));
	button.append(
		text(document, 'strong', item.title || item.kind || 'Message'),
		text(document, 'span', item.body || 'Open thread'),
		text(document, 'small', itemMeta(item))
	);
	card.append(button);
	if (!item.readAt) {
		const read = document.createElement('button');
		read.type = 'button';
		read.className = 'communicationsMarkRead';
		read.textContent = 'Mark read';
		read.addEventListener('click', () => onRead(item));
		card.append(read);
	}
	return card;
}

function itemMeta(item) {
	return [
		item.kind,
		item.fromAliasId ? `@${item.fromAliasId}` : '',
		item.threadId
	].filter(Boolean).join(' · ');
}

function text(document, tag, value) {
	const element = document.createElement(tag);
	element.textContent = value;
	return element;
}
