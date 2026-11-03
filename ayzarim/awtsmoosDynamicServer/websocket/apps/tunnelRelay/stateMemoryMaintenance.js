// B"H
// Boruch Hashem
// Blessed is He

const {
	COMPLETED_LIMIT,
	DURABLE_MIRROR_LIMIT,
	DURABLE_MIRROR_TTL_MS,
	PENDING_TTL_MS,
	QUARANTINE_LIMIT
} = require("./constants.js");

/**
 * @file stateMemoryMaintenance.js
 * @description
 * The Awtsmoos lets disk hold lasting relay truth while RAM carries only a measured reflection.
 * Awtsmoos.com trims terminal mirrors without severing a request that is still alive in motion.
 */

/** Return the best known millisecond timestamp for either mirror or durable-record shapes. */
function recordTimestamp(record) {
	const direct = Number(record?.at);
	if (Number.isFinite(direct) && direct > 0) return direct;
	const parsed = Date.parse(record?.updatedAt || record?.createdAt || "");
	return Number.isFinite(parsed) ? parsed : 0;
}

/** Never evict durable testimony for a request that still has active in-memory work. */
function protectedDurableKey(context, key) {
	return Boolean(
		context.pendingTunnelRequests?.has(key)
		|| context.tunnelRequestStarts?.has(key)
	);
}

/** Remove aged entries, then evict oldest unprotected entries until the limit is satisfied. */
function cleanupMap(store, limit, ttl, now, isProtected = () => false) {
	for (const [key, record] of store.entries()) {
		if (isProtected(key)) continue;
		const at = recordTimestamp(record);
		if (at && now - at > ttl) store.delete(key);
	}
	while (store.size > limit) {
		let removed = false;
		for (const key of store.keys()) {
			if (isProtected(key)) continue;
			store.delete(key);
			removed = true;
			break;
		}
		if (!removed) break;
	}
}

/** Bound every terminal relay-memory mirror while preserving disk-authoritative truth. */
function cleanup(context, now = Date.now()) {
	cleanupMap(context.completedTunnelRequests, COMPLETED_LIMIT, PENDING_TTL_MS, now);
	cleanupMap(context.expiredTunnelRequests, COMPLETED_LIMIT, PENDING_TTL_MS, now);
	cleanupMap(
		context.durableTunnelRequests,
		DURABLE_MIRROR_LIMIT,
		DURABLE_MIRROR_TTL_MS,
		now,
		key => protectedDurableKey(context, key)
	);
	if (context.tunnelResponseQuarantine.length > QUARANTINE_LIMIT) {
		context.tunnelResponseQuarantine.splice(
			0,
			context.tunnelResponseQuarantine.length - QUARANTINE_LIMIT
		);
	}
}

/** Record one suspicious response without altering canonical request truth. */
function quarantine(context, details = {}) {
	context.tunnelResponseQuarantine.push({ at: new Date().toISOString(), ...details });
	cleanup(context);
}

/** Return compact relay-memory counts, including the durable mirror previously hidden. */
function snapshot(context) {
	return {
		pending: context.pendingTunnelRequests.size,
		completed: context.completedTunnelRequests.size,
		durable: context.durableTunnelRequests.size,
		expired: context.expiredTunnelRequests.size,
		quarantined: context.tunnelResponseQuarantine.length
	};
}

module.exports = {
	cleanup,
	cleanupMap,
	protectedDurableKey,
	quarantine,
	recordTimestamp,
	snapshot
};
