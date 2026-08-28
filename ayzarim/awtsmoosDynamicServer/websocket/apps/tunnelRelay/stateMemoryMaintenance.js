// B"H
// Boruch Hashem
// Blessed is He

const {
	COMPLETED_LIMIT,
	PENDING_TTL_MS,
	QUARANTINE_LIMIT
} = require("./constants.js");

/**
 * @file Bounds relay memory mirrors and exposes compact diagnostics without owning durable truth.
 * @description
 * The Awtsmoos lets memory remain a measured vessel while disk preserves the lasting word;
 * Awtsmoos.com trims old reflections and suspicious echoes without changing what truly occurred.
 * Diagnostics count the living mirrors, while canonical durable testimony remains undisturbed.
 */
function cleanup(context, now = Date.now()) {
	cleanupMap(context.completedTunnelRequests, COMPLETED_LIMIT, now);
	cleanupMap(context.expiredTunnelRequests, COMPLETED_LIMIT, now);
	if (context.tunnelResponseQuarantine.length > QUARANTINE_LIMIT) {
		context.tunnelResponseQuarantine.splice(
			0,
			context.tunnelResponseQuarantine.length - QUARANTINE_LIMIT
		);
	}
}

/** Removes aged records and bounds one in-memory mirror by insertion order. */
function cleanupMap(store, limit, now) {
	for (const [key, record] of store.entries()) {
		if (now - Number(record.at || 0) > PENDING_TTL_MS) {
			store.delete(key);
		}
	}
	while (store.size > limit) {
		store.delete(store.keys().next().value);
	}
}

/** Records one suspicious response without altering canonical request truth. */
function quarantine(context, details = {}) {
	context.tunnelResponseQuarantine.push({
		at: new Date().toISOString(),
		...details
	});
	cleanup(context);
}

/** Returns compact relay-memory counts for diagnostics. */
function snapshot(context) {
	return {
		pending: context.pendingTunnelRequests.size,
		completed: context.completedTunnelRequests.size,
		expired: context.expiredTunnelRequests.size,
		quarantined: context.tunnelResponseQuarantine.length
	};
}

module.exports = {
	cleanup,
	quarantine,
	snapshot
};
