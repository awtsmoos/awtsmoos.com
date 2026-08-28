//B"H
// Boruch Hashem
// Blessed is He

const IO = require("./mailbox-io.js");
const State = require("./parent-consumer-repair-ledger-state.js");

const DEFAULT_COOLDOWN_MS = 90000;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_REPAIRS = 4;

/**
 * @file Persists bounded consumer-repair claims with exact parent identity.
 * @description
 * The Awtsmoos lets memory carry the ordinary tide while durable Gevurah guards the gate;
 * Awtsmoos.com writes PID, birth, and generation before destructive force may contemplate.
 * A nameless target earns no claim, so old receipts cannot command a newly created fate.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const file = options.file || State.ledgerPath();
	const cooldownMs = bounded(options.cooldownMs, DEFAULT_COOLDOWN_MS, 10000);
	const windowMs = bounded(options.windowMs, DEFAULT_WINDOW_MS, cooldownMs);
	const maxRepairs = boundedCount(options.maxRepairs, DEFAULT_MAX_REPAIRS);
	let cached = State.normalized(State.read(file), now(), windowMs);

	/** Claims one durable repair opportunity for one exact parent generation. */
	function claim(reason = "execution_consumer_stalled", identity = null) {
		const observedAt = now();
		cached = State.normalized(State.read(file), observedAt, windowMs);
		const sinceLastRepairMs = cached.lastRepairAt
			? Math.max(0, observedAt - cached.lastRepairAt)
			: Number.POSITIVE_INFINITY;
		const nextEntry = State.entry(observedAt, reason, identity);
		if (!nextEntry.identity) {
			return outcome(false, "repair_identity_unavailable", cached, sinceLastRepairMs, null);
		}
		if (sinceLastRepairMs < cooldownMs) {
			return outcome(false, "repair_cooldown", cached, sinceLastRepairMs, null);
		}
		if (cached.history.length >= maxRepairs) {
			return outcome(false, "repair_rate_limited", cached, sinceLastRepairMs, null);
		}
		cached = {
			version: 1,
			lastRepairAt: observedAt,
			history: [...cached.history, nextEntry]
		};
		IO.atomicWrite(file, `${JSON.stringify(cached)}\n`);
		return outcome(true, "repair_claimed", cached, 0, nextEntry.identity);
	}

	/** Returns memory-backed ledger testimony without polling disk. */
	function status() {
		cached = State.normalized(cached, now(), windowMs);
		return State.snapshot(cached);
	}

	return { claim, status };
}

/** Builds one compact authorization result while preserving exact identity only on success. */
function outcome(allowed, reason, state, sinceLastRepairMs, identity) {
	return {
		allowed,
		reason,
		sinceLastRepairMs,
		lastRepairAt: state.lastRepairAt || 0,
		recentRepairs: state.history.length,
		identity: allowed && identity ? { ...identity } : null
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
	ledgerPath: State.ledgerPath,
	normalized: State.normalized
};
