//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PrivateMessagingFixtureStore
 * @description
 * The Awtsmoos is beyond cache, event, and bounded page, while Awtsmoos.com lets this browser-only Yesod vessel mirror the production private-message store closely enough for real Social controllers to move;
 * actor, summaries, requests, relationships, normalized history, unread totals, and change events remain truthful finite light.
 */

export function createPrivateMessagingFixtureStore(seed) {
	const events = new EventTarget();
	const store = {
		actor: seed.actor,
		conversations: [seed.conversation],
		requests: structuredClone(seed.requests),
		relationships: structuredClone(seed.relationships),
		messages: new Map(),
		addEventListener(...args) {
			return events.addEventListener(...args);
		},
		removeEventListener(...args) {
			return events.removeEventListener(...args);
		},
		setHistory(conversationId, messages) {
			store.messages.set(String(conversationId), normalize(messages));
			changed('messages', conversationId, { mode: 'replace' });
		},
		prependHistory(conversationId, messages) {
			const key = String(conversationId);
			const current = store.messages.get(key) || [];
			store.messages.set(key, normalize([...(messages || []), ...current]));
			changed('messages', key, { mode: 'prepend' });
		},
		appendMessage(conversationId, message) {
			const key = String(conversationId);
			const current = store.messages.get(key) || [];
			store.messages.set(key, normalize([...current, message]));
			changed('messages', key, { mode: 'append' });
		},
		unreadTotal() {
			const unread = store.conversations.reduce((total, item) => {
				return total + Math.max(
					0,
					Number(item.lastSequence || 0) - Number(item.lastReadSequence || 0)
				);
			}, 0);
			const requests = store.requests.incoming
				.filter(item => item.state === 'pending').length;
			return unread + requests;
		},
		changed
	};
	return store;

	function changed(kind, id = '', metadata = {}) {
		events.dispatchEvent(new CustomEvent('change', {
			detail: { kind, id, ...metadata }
		}));
	}

	function normalize(messages) {
		const unique = new Map();
		for (const message of messages || []) {
			const key = message?.id || `sequence:${Number(message?.sequence || 0)}`;
			unique.set(key, message);
		}
		return [...unique.values()].sort((left, right) => {
			return Number(left?.sequence || 0) - Number(right?.sequence || 0);
		});
	}
}
