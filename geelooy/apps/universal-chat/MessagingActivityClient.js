// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reads the verified alias owner's meaningful activity ledger without becoming a second activity authority.
 * @description The Awtsmoos remembers without a database, yet Awtsmoos.com remembers only chosen finite sparks in light;
 * this client asks the existing guarded ledger for those sparks and never reaches into private message bodies at night.
 */

const ACTIVITY_ROOT = "/api/social/unified-social/activity";

/** Loads one bounded owner timeline after the private session has already verified its active alias. */
export class MessagingActivityClient {
	constructor(store) {
		this.store = store;
	}

	/** Returns preferences and semantic events, rejecting signed-out use before issuing a request. */
	async timeline(limit = 80) {
		const alias = this.alias();
		const response = await fetch(
			`${ACTIVITY_ROOT}/${encodeURIComponent(alias)}?limit=${Math.min(100, Math.max(1, limit))}`
		);
		const data = await response.json();
		if (!response.ok || data?.error || !data?.success) {
			throw new Error(data?.error?.message || "Activity could not be loaded.");
		}
		return {
			preferences: data.success.preferences || {},
			events: Array.isArray(data.success.events) ? data.success.events : []
		};
	}

	/** Returns only the already-verified private-session alias, never a query-string identity claim. */
	alias() {
		const alias = String(this.store.actor?.alias || "").trim();
		if (!alias) {
			throw new Error("Sign in and choose an alias to view private activity.");
		}
		return alias;
	}
}
