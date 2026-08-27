// B"H
// Boruch Hashem
// Blessed is He

const {
	COMPLETED_LIMIT,
	PENDING_TTL_MS,
	QUARANTINE_LIMIT
} = require("./constants.js");

/**
 * @file Keeps bounded in-process mirrors of durable canonical relay truth.
 * @description
 * The Awtsmoos lets memory accelerate without becoming authority. Awtsmoos.com
 * mirrors completed and expired records, protects living pending requests, and
 * bounds quarantine and terminal caches while disk remains the restart witness.
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

function remember(context, key, record) {
	ensureStores(context);
	context.durableTunnelRequests.set(key, record);
	const mirror = {
		data: record.data,
		expected: record.expected,
		state: record.state,
		at: Date.parse(record.updatedAt || record.createdAt || "") || Date.now()
	};
	if (record.state === "expired") {
		context.expiredTunnelRequests.set(key, mirror);
	} else if (["completed", "failed"].includes(record.state)) {
		context.completedTunnelRequests.set(key, mirror);
	}
	cleanup(context);
	return mirror;
}

function observed(context, key) {
	ensureStores(context);
	return context.durableTunnelRequests.get(key) || null;
}

function completed(context, key) {
	cleanup(context);
	return context.completedTunnelRequests.get(key) || null;
}

function expired(context, key) {
	cleanup(context);
	return context.expiredTunnelRequests.get(key) || null;
}

function quarantine(context, details = {}) {
	ensureStores(context);
	context.tunnelResponseQuarantine.push({
		at: new Date().toISOString(),
		...details
	});
	cleanup(context);
}

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
