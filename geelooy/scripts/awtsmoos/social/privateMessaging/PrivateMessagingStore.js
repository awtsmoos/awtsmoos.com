// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps compact private social state plus only the history pages the user has deliberately opened.
 * @description The Awtsmoos renews every private room without loading its whole past, while Awtsmoos.com keeps bounded pages in light;
 * older pages merge by durable identity and sequence, so pagination expands memory without duplication or swallowing the present from sight.
 */

/** Stores authorized private summaries, relationship state, and bounded opened-thread history. */
export class PrivateMessagingStore extends EventTarget {
	constructor() {
		super();
		this.actor = null;
		this.conversations = [];
		this.requests = { incoming: [], outgoing: [] };
		this.relationships = { friends: [], blocks: [], settings: {} };
		this.messages = new Map();
	}

	adoptSession(payload) {
		this.actor = payload.actor || null;
		this.conversations = payload.conversations || [];
		this.requests = payload.requests || { incoming: [], outgoing: [] };
		this.relationships = payload.relationships || { friends: [], blocks: [], settings: {} };
		this.changed("session");
	}

	setConversations(values) {
		this.conversations = values || [];
		this.changed("conversations");
	}

	setRequests(payload) {
		this.requests = payload || { incoming: [], outgoing: [] };
		this.changed("requests");
	}

	setRelationships(payload) {
		this.relationships = payload || { friends: [], blocks: [], settings: {} };
		this.changed("relationships");
	}

	setHistory(conversationId, messages) {
		this.messages.set(conversationId, normalizeMessages(messages));
		this.changed("messages", conversationId, { mode: "replace" });
	}

	prependHistory(conversationId, messages) {
		const current = this.messages.get(conversationId) || [];
		this.messages.set(
			conversationId,
			normalizeMessages([...(messages || []), ...current])
		);
		this.changed("messages", conversationId, { mode: "prepend" });
	}

	appendMessage(conversationId, message) {
		const current = this.messages.get(conversationId) || [];
		this.messages.set(
			conversationId,
			normalizeMessages([...current, message])
		);
		this.changed("messages", conversationId, { mode: "append" });
	}

	unreadTotal() {
		const messages = this.conversations.reduce((total, item) => {
			return total + Math.max(
				0,
				Number(item.lastSequence || 0) - Number(item.lastReadSequence || 0)
			);
		}, 0);
		return messages + this.requests.incoming.filter((item) => item.state === "pending").length;
	}

	changed(kind, id = "", metadata = {}) {
		this.dispatchEvent(new CustomEvent("change", {
			detail: { kind, id, ...metadata }
		}));
	}
}

function normalizeMessages(messages) {
	const unique = new Map();
	for (const message of messages || []) {
		const key = message?.id || `sequence:${Number(message?.sequence || 0)}`;
		unique.set(key, message);
	}
	return [...unique.values()].sort((left, right) => {
		return Number(left?.sequence || 0) - Number(right?.sequence || 0);
	});
}
