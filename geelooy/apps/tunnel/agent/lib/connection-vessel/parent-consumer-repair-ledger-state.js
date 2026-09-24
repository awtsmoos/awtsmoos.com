//B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const path = require("node:path");
const IO = require("./mailbox-io.js");
const RepairIdentity = require("./parent-repair-identity.js");

const CLAIM_STATE_CLAIMED = "claimed";
const CLAIM_STATE_PROVEN = "proven";

/**
 * @file Shapes and prunes durable parent-consumer repair history.
 * @description
 * The Awtsmoos renews each generation while this Keli remembers only proven light;
 * Awtsmoos.com keeps PID, birth, and generation joined so old force cannot gain new right.
 * History fades beyond its bounded window, yet exact identity stays written bright.
 * A claim is only a promise until settlement proves it; phantoms are unremembered.
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
function entry(observedAt, reason, identity, state = CLAIM_STATE_CLAIMED) {
	const at = Number(observedAt || 0);
	const reasonText = String(reason || "execution_consumer_stalled");
	const normalizedIdentity = RepairIdentity.normalize(identity);
	return {
		at,
		reason: reasonText,
		identity: normalizedIdentity,
		state: state === CLAIM_STATE_PROVEN ? CLAIM_STATE_PROVEN : CLAIM_STATE_CLAIMED,
		claimId: claimIdFor(at, reasonText, normalizedIdentity)
	};
}

/** Builds the deterministic key binding one claim to one timestamp, reason, and identity. */
function claimIdFor(at, reason, identity) {
	return `${Number(at || 0)}:${String(reason || "")}:${RepairIdentity.key(identity)}`;
}

/** Prunes expired history and normalizes legacy entries without inventing identity. */
function normalized(value = {}, observedAt, windowMs) {
	const history = Array.isArray(value.history)
		? value.history
			.filter(item => observedAt - Number(item?.at || 0) <= windowMs)
			.map(item => {
				const rebuilt = entry(item.at, item.reason, item.identity);
				// Entries written before claim states existed record historical real
				// repairs: they count as proven and are never downgraded.
				rebuilt.state = item?.state === CLAIM_STATE_CLAIMED ? CLAIM_STATE_CLAIMED : CLAIM_STATE_PROVEN;
				if (typeof item?.claimId === "string" && item.claimId) rebuilt.claimId = item.claimId;
				return rebuilt;
			})
		: [];
	return {
		version: 1,
		lastRepairAt: Number(value.lastRepairAt || 0),
		history
	};
}

/** Returns a defensive copy suitable for diagnostics without shared mutable identity. */
function snapshot(value = {}) {
	const history = Array.isArray(value.history)
		? value.history.map(item => ({
				...item,
				identity: item.identity ? { ...item.identity } : null
			}))
		: [];
	return {
		version: 1,
		lastRepairAt: Number(value.lastRepairAt || 0),
		claimedCount: history.filter(item => item.state === CLAIM_STATE_CLAIMED).length,
		provenCount: history.filter(item => item.state === CLAIM_STATE_PROVEN).length,
		history
	};
}

module.exports = {
	CLAIM_STATE_CLAIMED,
	CLAIM_STATE_PROVEN,
	claimIdFor,
	entry,
	ledgerPath,
	normalized,
	read,
	snapshot
};
