//B"H
//Boruch Hashem
//Blessed is He

import {
	conversationCard,
	relationshipChip,
	requestCard
} from './MessagesCards.js';

/**
 * @module MessagesSections
 * @description
 * The Awtsmoos is beyond count, room, consent, friendship, and block, while Awtsmoos.com lets each proven communications region remain visible even when its collection is empty;
 * this Tiferes-like renderer gives metrics and next-step guidance without turning the Social route into another private-message store in light.
 */
export function renderMessageSections(root, store, handlers) {
	renderSummary(root, store);
	renderConversations(root, store, handlers.onOpen);
	renderRequests(root, store, handlers.onResolve);
	renderRelationships(root, store);
}

function renderSummary(root, store) {
	const pending = store.requests.incoming
		.filter(item => item.state === 'pending').length;
	const summary = root.getElementById('hubMessagesSummary');
	summary?.replaceChildren(
		metric(root, store.unreadTotal(), 'Unread'),
		metric(root, store.conversations.length, 'Conversations'),
		metric(root, pending, 'Awaiting consent')
	);
}

function renderConversations(root, store, onOpen) {
	const region = root.getElementById('hubMessagesConversations');
	if (!region) return;
	const cards = store.conversations.map(item => {
		return conversationCard(root, item, onOpen);
	});
	region.replaceChildren(
		sectionHeading(root, 'Conversations', 'Accepted private rooms'),
		...(cards.length ? cards : [empty(root, 'No accepted conversations yet.')])
	);
}

function renderRequests(root, store, onResolve) {
	const region = root.getElementById('hubMessagesRequests');
	if (!region) return;
	const incoming = store.requests.incoming.map(item => {
		return requestCard(root, item, true, onResolve);
	});
	const outgoing = store.requests.outgoing.map(item => {
		return requestCard(root, item, false, onResolve);
	});
	const cards = [...incoming, ...outgoing];
	region.replaceChildren(
		sectionHeading(root, 'Requests', 'Consent comes before private access'),
		...(cards.length ? cards : [empty(root, 'No private conversation requests are waiting.')])
	);
}

function renderRelationships(root, store) {
	const region = root.getElementById('hubMessagesRelationships');
	if (!region) return;
	const friends = (store.relationships.friends || []).map(item => {
		return relationshipChip(root, item, 'friend');
	});
	const blocks = (store.relationships.blocks || []).map(item => {
		return relationshipChip(root, item, 'blocked');
	});
	const chips = [...friends, ...blocks];
	region.replaceChildren(
		sectionHeading(root, 'Relationships', 'Friends and blocked aliases'),
		...(chips.length ? chips : [empty(root, 'No messaging relationships are recorded yet.')])
	);
}

function metric(root, value, label) {
	const item = root.createElement('div');
	item.className = 'hubMessagesMetric';
	item.append(
		text(root, 'strong', String(value)),
		text(root, 'span', label)
	);
	return item;
}

function sectionHeading(root, title, description) {
	const header = root.createElement('header');
	header.className = 'hubMessagesSectionHeading';
	header.append(
		text(root, 'h3', title),
		text(root, 'p', description)
	);
	return header;
}

function empty(root, value) {
	return text(root, 'p', value, 'hubMessagesEmpty');
}

function text(root, tag, value, className = '') {
	const node = root.createElement(tag);
	node.textContent = value;
	if (className) node.className = className;
	return node;
}
