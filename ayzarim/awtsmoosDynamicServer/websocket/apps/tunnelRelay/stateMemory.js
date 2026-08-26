// B"H
// Boruch Hashem
// Blessed is He

const Result = require("./durableRecordResult.js");
const {
	COMPLETED_LIMIT,
	PENDING_TTL_MS,
	QUARANTINE_LIMIT
} = require("./constants.js");

/**
 * @file Mirrors durable relay truth without letting an old timeout hide a later proven deed.
 * @description
 * The Awtsmoos lets memory accelerate testimony without becoming its source. Awtsmoos.com
 * keeps the original transport expiration visible, yet mirrors a verified late native
 * terminal result as completed operational truth so reconnecting observers cannot be misled.
 */
function ensureStores(context) {
	context.pendingTunnelRequests ||= new Map();
	context.completedTunnelRequests ||= new Map();
	context.expiredTunnelRequests ||= new Map();
	context.durableTunnelRequests ||= new Map();
	context.tunnelHydrations ||= new Map();
	context.tunnelDurableMutations ||= new Map();
	context.tunnelResponseQuarantine ||= [];
	return context;
}

/** Removes old bounded mirrors while disk remains authoritative. */
function cleanup(context, now = Date.now()) {
	ensureStores(context);
	cleanupMap(context.completedTunnelRequests, COMPLETED_LIMIT, now);
	cleanupMap(context.expiredTunnelRequests, COMPLETED_LIMIT, now);
	if (context.tunnelResponseQuarantine.length > QUARANTINE_LIMIT) {
		context.tunnelResponseQuarantine.splice(
			0,
			context.tunnelResponseQuarantine.length - QUARANTINE_LIMIT
		);
	}
}

/** Removes aged records and then bounds one in-memory mirror by insertion order. */
function cleanupMap(store, limit, now) {
	for (const [key, record] of store.entries()) {
		if (now - Number(record.at || 0) > PENDING_TTL_MS) store.delete(key);
	}
	while (store.size > limit) store.delete(store.keys().next().value);
}

/**
 * Mirrors one durable record while preserving both historical and effective terminal views.
 *
 * @param {object} context Relay state container.
 * @param {string} key Durable request key.
 * @param {object} record Disk-authoritative record.
 * @returns {object} Effective in-memory mirror.
 */
function remember(context, key, record) {
	ensureStores(context);
	context.durableTunnelRequests.set(key, record);
	const at = Date.parse(record.updatedAt || record.createdAt || "") || Date.now();
	const effectiveMirror = {
		data: Result.effectiveData(record),
		expected: record.expected,
		state: Result.effectiveState(record),
		sourceState: record.state,
		at
	};

	if (record.state === "expired") {
		context.expiredTunnelRequests.set(key, {
			data: record.data,
			expected: record.expected,
			state: "expired",
			at
		});
	}
	if (["completed", "failed"].includes(record.state) || Result.hasLateTerminal(record)) {
		context.completedTunnelRequests.set(key, effectiveMirror);
	}
	cleanup(context);
	return effectiveMirror;
}

/** Returns the raw durable record mirror, including reconciliation history. */
function observed(context, key) {
	ensureStores(context);
	return context.durableTunnelRequests.get(key) || null;
}

/** Returns the effective completed result mirror when one is known. */
function completed(context, key) {
	cleanup(context);
	return context.completedTunnelRequests.get(key) || null;
}

/** Returns the historical transport-expiration mirror when one occurred. */
function expired(context, key) {
	cleanup(context);
	return context.expiredTunnelRequests.get(key) || null;
}

/** Records a bounded suspicious response without altering canonical request truth. */
function quarantine(context, details = {}) {
	ensureStores(context);
	context.tunnelResponseQuarantine.push({ at: new Date().toISOString(), ...details });
	cleanup(context);
}

/** Returns compact relay-memory counts for diagnostics. */
function snapshot(context) {
	ensureStores(context);
	return {
		pending: context.pendingTunnelRequests.size,
		completed: context.completedTunnelRequests.size,
		expired: context.expiredTunnelRequests.size,
		quarantined: context.tunnelResponseQuarantine.length
	};
}

module.exports = {
	cleanup,
	completed,
	ensureStores,
	expired,
	observed,
	quarantine,
	remember,
	snapshot
};
