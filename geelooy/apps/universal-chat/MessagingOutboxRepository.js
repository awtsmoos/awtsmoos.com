// B"H
// Boruch Hashem
// Blessed is He

import {
	OUTBOX_INTENTS_STORE,
	requestValue
} from "./MessagingOutboxDatabase.js";

/**
 * @file Owns durable intent reads and mutations while keeping IndexedDB transaction ceremony outside delivery policy.
 * @description The Awtsmoos contains every queued vessel before list and key divide; Awtsmoos.com keeps one repository of finite intentions in light,
 * so coordinators may reason about due, retrying, terminal, and uploaded states without touching browser transaction machinery at every turn.
 */

export class MessagingOutboxRepository {
	constructor(database) {
		this.database = database;
	}

	put(intent) {
		return this.database.withStore(OUTBOX_INTENTS_STORE, "readwrite", async (store) => {
			await requestValue(store.put(intent));
			return intent;
		});
	}

	get(id) {
		return this.database.withStore(OUTBOX_INTENTS_STORE, "readonly", (store) => (
			requestValue(store.get(id))
		));
	}

	remove(id) {
		return this.database.withStore(OUTBOX_INTENTS_STORE, "readwrite", async (store) => {
			await requestValue(store.delete(id));
			return true;
		});
	}

	listAll() {
		return this.database.withStore(OUTBOX_INTENTS_STORE, "readonly", async (store) => {
			const rows = await requestValue(store.getAll());
			return Array.isArray(rows) ? rows : [];
		});
	}

	async listDue(now = Date.now()) {
		const rows = await this.listAll();
		return rows
			.filter((row) => ["queued", "retry"].includes(row?.state))
			.filter((row) => Number(row?.nextAttemptAt || 0) <= Number(now))
			.sort((left, right) => Number(left.createdAt) - Number(right.createdAt));
	}

	update(id, patch) {
		return this.database.withStore(OUTBOX_INTENTS_STORE, "readwrite", async (store) => {
			const current = await requestValue(store.get(id));
			if (!current) return null;
			const next = { ...current, ...patch, id: current.id };
			await requestValue(store.put(next));
			return next;
		});
	}
}
