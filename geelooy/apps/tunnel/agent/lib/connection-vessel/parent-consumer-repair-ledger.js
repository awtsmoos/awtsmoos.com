// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const path = require("node:path");
const IO = require("./mailbox-io.js");

const DEFAULT_COOLDOWN_MS = 90000;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_REPAIRS = 4;

/**
 * @file Persists rare consumer-repair claims without polling disk during child health ticks.
 * @description
 * The Awtsmoos lets memory carry the ordinary moment while durable Gevurah is written
 * only when repair authority is actually sought. Awtsmoos.com hydrates once per child
 * generation, rereads disk at claim time for cross-generation truth, then keeps status hot.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const file = options.file || ledgerPath();
	const cooldownMs = bounded(options.cooldownMs, DEFAULT_COOLDOWN_MS, 10000);
	const windowMs = bounded(options.windowMs, DEFAULT_WINDOW_MS, cooldownMs);
	const maxRepairs = boundedCount(options.maxRepairs, DEFAULT_MAX_REPAIRS);
	let cached = normalized(read(file), now(), windowMs);

	/**
	 * Claims one bounded repair opportunity before the parent receives a signal.
	 * Disk is reread only here so overlapping generations see the newest durable claim.
	 */
	function claim(reason = "execution_consumer_stalled") {
		const observedAt = now();
		cached = normalized(read(file), observedAt, windowMs);
		const sinceLastRepairMs = cached.lastRepairAt
			? Math.max(0, observedAt - cached.lastRepairAt)
			: Number.POSITIVE_INFINITY;
		if (sinceLastRepairMs < cooldownMs) {
			return outcome(false, "repair_cooldown", cached, sinceLastRepairMs);
		}
		if (cached.history.length >= maxRepairs) {
			return outcome(false, "repair_rate_limited", cached, sinceLastRepairMs);
		}
		cached = {
			version: 1,
			lastRepairAt: observedAt,
			history: [...cached.history, {
				at: observedAt,
				reason: String(reason || "execution_consumer_stalled")
			}]
		};
		IO.atomicWrite(file, `${JSON.stringify(cached)}\n`);
		return outcome(true, "repair_claimed", cached, 0);
	}

	/** Returns a memory-backed bounded snapshot; no filesystem read occurs here. */
	function status() {
		cached = normalized(cached, now(), windowMs);
		return {
			version: cached.version,
			lastRepairAt: cached.lastRepairAt,
			history: cached.history.map(entry => ({ ...entry }))
		};
	}

	return { claim, status };
}

/** Returns the recovery-safe cross-generation ledger location. */
function ledgerPath() {
	const root = process.env.AWTSMOOS_RECOVERY_ROOT ||
		path.join(os.homedir(), ".awtsmoos-tunnel-recovery");
	return path.join(root, "state", "consumer-auto-repair.json");
}

/** Reads the ledger conservatively; absence means no previous repair. */
function read(file) {
	return IO.read(file) || {};
}

/** Prunes history outside the active storm-protection window. */
function normalized(value = {}, observedAt, windowMs) {
	const history = Array.isArray(value.history)
		? value.history.filter(entry => observedAt - Number(entry.at || 0) <= windowMs)
		: [];
	return {
		version: 1,
		lastRepairAt: Number(value.lastRepairAt || 0),
		history
	};
}

/** Builds one compact repair-authorization result. */
function outcome(allowed, reason, state, sinceLastRepairMs) {
	return {
		allowed,
		reason,
		sinceLastRepairMs,
		lastRepairAt: state.lastRepairAt || 0,
		recentRepairs: state.history.length
	};
}

function bounded(value, fallback, minimum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.floor(number))
		: fallback;
}

function boundedCount(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1, Math.min(20, Math.floor(number)))
		: fallback;
}

module.exports = {
	DEFAULT_COOLDOWN_MS,
	DEFAULT_MAX_REPAIRS,
	DEFAULT_WINDOW_MS,
	create,
	ledgerPath,
	normalized
};
