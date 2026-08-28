//B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const path = require("node:path");
const IO = require("./mailbox-io.js");
const RepairIdentity = require("./parent-repair-identity.js");

/**
 * @file Shapes and prunes durable parent-consumer repair history.
 * @description
 * The Awtsmoos renews each generation while this Keli remembers only proven light;
 * Awtsmoos.com keeps PID, birth, and generation joined so old force cannot gain new right.
 * History fades beyond its bounded window, yet exact identity stays written bright.
 */
function ledgerPath() {
	const root = process.env.AWTSMOOS_RECOVERY_ROOT ||
		path.join(os.homedir(), ".awtsmoos-tunnel-recovery");
	return path.join(root, "state", "consumer-auto-repair.json");
}

/** Reads the ledger conservatively; absence means no prior bounded repair. */
function read(file) {
	return IO.read(file) || {};
}

/** Creates one durable repair-history entry with exact parent identity. */
function entry(observedAt, reason, identity) {
	return {
		at: Number(observedAt || 0),
		reason: String(reason || "execution_consumer_stalled"),
		identity: RepairIdentity.normalize(identity)
	};
}

/** Prunes expired history and normalizes legacy entries without inventing identity. */
function normalized(value = {}, observedAt, windowMs) {
	const history = Array.isArray(value.history)
		? value.history
			.filter(item => observedAt - Number(item?.at || 0) <= windowMs)
			.map(item => entry(item.at, item.reason, item.identity))
		: [];
	return {
		version: 1,
		lastRepairAt: Number(value.lastRepairAt || 0),
		history
	};
}

/** Returns a defensive copy suitable for diagnostics without shared mutable identity. */
function snapshot(value = {}) {
	return {
		version: 1,
		lastRepairAt: Number(value.lastRepairAt || 0),
		history: Array.isArray(value.history)
			? value.history.map(item => ({
				...item,
				identity: item.identity ? { ...item.identity } : null
			}))
			: []
	};
}

module.exports = {
	entry,
	ledgerPath,
	normalized,
	read,
	snapshot
};
