//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MessagesSections
 * @description
 * The Awtsmoos lets unread measures, accepted rooms, pending consent, friends, and blocks each keep a small visual vessel;
 * Awtsmoos.com renders those store-proven sections without asking the route shell to become another private messaging application.
 */
import {
	conversationCard,
	relationshipChip,
	requestCard
} from './MessagesCards.js';

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
		metric(root, store.unreadTotal(), 'unread'),
		metric(root, store.conversations.length, 'rooms'),
		metric(root, pending, 'requests')
	);
}

function renderConversations(root, store, onOpen) {
	const region = root.getElementById('hubMessagesConversations');
	const cards = store.conversations.map(item => {
		return conversationCard(root, item, onOpen);
	});
	region?.replaceChildren(text(root, 'h3', 'Conversations'), ...cards);
}

function renderRequests(root, store, onResolve) {
	const region = root.getElementById('hubMessagesRequests');
	const incoming = store.requests.incoming.map(item => {
		return requestCard(root, item, true, onResolve);
	});
	const outgoing = store.requests.outgoing.map(item => {
		return requestCard(root, item, false, onResolve);
	});
	region?.replaceChildren(
		text(root, 'h3', 'Requests'),
		...incoming,
		...outgoing
	);
}

function renderRelationships(root, store) {
	const region = root.getElementById('hubMessagesRelationships');
	const friends = (store.relationships.friends || []).map(item => {
		return relationshipChip(root, item, 'friend');
	});
	const blocks = (store.relationships.blocks || []).map(item => {
		return relationshipChip(root, item, 'blocked');
	});
	region?.replaceChildren(
		text(root, 'h3', 'Relationships'),
		...friends,
		...blocks
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

function text(root, tag, value) {
	const node = root.createElement(tag);
	node.textContent = value;
	return node;
}
