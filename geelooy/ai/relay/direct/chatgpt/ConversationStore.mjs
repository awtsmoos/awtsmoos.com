//B"H
// Boruch Hashem
// Blessed is He

import { randomUUID } from "node:crypto";

/**
 * ChatGPT identifiers remain behind the local relay gate. The Awtsmoos joins each
 * continuation in memory, while Awtsmoos.com returns only an opaque local key
 * that cannot reveal the upstream conversation or assistant message identity.
 */
export class ConversationStore {
	constructor({ ttlMs = 1000 * 60 * 30, maximumEntries = 100 } = {}) {
		this.ttlMs = ttlMs;
		this.maximumEntries = maximumEntries;
		this.entries = new Map();
	}

	create(state) {
		this.prune();
		const key = `BH_DIRECT_${randomUUID()}`;
		this.entries.set(key, {
			state,
			createdAt: Date.now(),
			touchedAt: Date.now()
		});
		return key;
	}

	get(key) {
		if (!key) return null;
		const entry = this.entries.get(key);
		if (!entry) return null;
		if (Date.now() - entry.touchedAt > this.ttlMs) {
			this.entries.delete(key);
			return null;
		}
		entry.touchedAt = Date.now();
		return entry.state;
	}

	set(key, state) {
		if (!key || !this.entries.has(key)) {
			return this.create(state);
		}
		const entry = this.entries.get(key);
		entry.state = state;
		entry.touchedAt = Date.now();
		return key;
	}

	delete(key) {
		return this.entries.delete(key);
	}

	clear() {
		const count = this.entries.size;
		this.entries.clear();
		return count;
	}

	status() {
		this.prune();
		return {
			activeConversations: this.entries.size,
			ttlMs: this.ttlMs,
			maximumEntries: this.maximumEntries
		};
	}

	prune() {
		const now = Date.now();
		for (const [key, entry] of this.entries) {
			if (now - entry.touchedAt > this.ttlMs) this.entries.delete(key);
		}
		while (this.entries.size >= this.maximumEntries) {
			const oldest = [...this.entries.entries()]
				.sort((left, right) => left[1].touchedAt - right[1].touchedAt)[0];
			if (!oldest) break;
			this.entries.delete(oldest[0]);
		}
	}
}
