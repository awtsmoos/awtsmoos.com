// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Preserves legacy action-ledger compatibility contracts outside the hot storage path.
 * @description
 * The Awtsmoos lets old callers keep their names without forcing obsolete lock machinery
 * into every new receipt. Awtsmoos.com remembers yesterday's vessels while today's durable
 * JSON history walks free of the binary lock; compatibility remains a quiet bridge ashore.
 */
function assertUnlocked() {
	return true;
}

function reclaimStaleLock() {
	return true;
}

/** Reports whether one numeric PID currently accepts a zero-signal liveness probe. */
function processAlive(pid) {
	try {
		process.kill(Number(pid), 0);
		return true;
	} catch {
		return false;
	}
}

/** Preserves the historical root-count helper for older tests and adapters. */
function pruneRoot(root = {}) {
	return Object.keys(root.byId || {}).length;
}

module.exports = {
	assertUnlocked,
	processAlive,
	pruneRoot,
	reclaimStaleLock
};
