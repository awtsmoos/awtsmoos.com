// B"H
// Boruch Hashem
// Blessed is He

import {
	OUTBOX_META_STORE,
	requestValue
} from "./MessagingOutboxDatabase.js";

/**
 * @file Grants one renewable delivery lease across tabs using a single atomic IndexedDB readwrite transaction.
 * @description The Awtsmoos is one though browsers multiply tabs; Awtsmoos.com lets only one finite worker carry queued speech at a time,
 * while expiry permits a silent or crashed tab to surrender authority without a permanent lock or a duplicate messenger rising in its place.
 */

const LEASE_KEY = "delivery-lease";
export const OUTBOX_LEASE_MS = 30000;

export class MessagingOutboxLease {
	constructor(database, options = {}) {
		this.database = database;
		this.ownerId = options.ownerId || createOwnerId();
		this.clock = options.clock || Date.now;
		this.ttlMs = Number(options.ttlMs || OUTBOX_LEASE_MS);
	}

	/** Atomically acquires an absent/expired lease or renews this owner's existing lease. */
	acquire() {
		return this.database.withStore(OUTBOX_META_STORE, "readwrite", async (store) => {
			const now = Number(this.clock());
			const current = await requestValue(store.get(LEASE_KEY));
			if (current && current.ownerId !== this.ownerId && Number(current.expiresAt) > now) {
				return { acquired: false, retryAt: Number(current.expiresAt) };
			}
			const lease = { key: LEASE_KEY, ownerId: this.ownerId, expiresAt: now + this.ttlMs };
			await requestValue(store.put(lease));
			return { acquired: true, expiresAt: lease.expiresAt };
		});
	}

	/** Renews authority only when this exact owner still holds the lease. */
	renew() {
		return this.database.withStore(OUTBOX_META_STORE, "readwrite", async (store) => {
			const current = await requestValue(store.get(LEASE_KEY));
			if (!current || current.ownerId !== this.ownerId) return false;
			await requestValue(store.put({
				...current,
				expiresAt: Number(this.clock()) + this.ttlMs
			}));
			return true;
		});
	}

	/** Releases only this owner's lease, never a successor that acquired after expiry. */
	release() {
		return this.database.withStore(OUTBOX_META_STORE, "readwrite", async (store) => {
			const current = await requestValue(store.get(LEASE_KEY));
			if (!current || current.ownerId !== this.ownerId) return false;
			await requestValue(store.delete(LEASE_KEY));
			return true;
		});
	}
}

function createOwnerId() {
	if (typeof globalThis.crypto?.randomUUID === "function") {
		return `outbox-${globalThis.crypto.randomUUID()}`;
	}
	return `outbox-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
