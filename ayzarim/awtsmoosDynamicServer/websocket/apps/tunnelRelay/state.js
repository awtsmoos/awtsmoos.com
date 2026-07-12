// B"H

const { COMPLETED_LIMIT, PENDING_TTL_MS, QUARANTINE_LIMIT } = require("./constants.js");

function ensureStores(context) {
	context.pendingTunnelRequests ||= new Map();
	context.completedTunnelRequests ||= new Map();
	context.tunnelResponseQuarantine ||= [];
	return context;
}

function cleanupMap(store, limit, now = Date.now()) {
	for (const [id, record] of store.entries()) {
		if (now - Number(record.at || 0) > PENDING_TTL_MS) store.delete(id);
	}
	while (store.size > limit) store.delete(store.keys().next().value);
}

function cleanup(context) {
	ensureStores(context);
	cleanupMap(context.completedTunnelRequests, COMPLETED_LIMIT);
	if (context.tunnelResponseQuarantine.length > QUARANTINE_LIMIT) {
		context.tunnelResponseQuarantine.splice(0, context.tunnelResponseQuarantine.length - QUARANTINE_LIMIT);
	}
}

function rememberCompleted(context, id, data, expected) {
	ensureStores(context);
	context.completedTunnelRequests.set(id, { data, expected, at: Date.now() });
	cleanup(context);
}

function completed(context, id) {
	cleanup(context);
	return context.completedTunnelRequests.get(id) || null;
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
		quarantined: context.tunnelResponseQuarantine.length
	};
}

module.exports = { cleanup, completed, ensureStores, quarantine, rememberCompleted, snapshot };
