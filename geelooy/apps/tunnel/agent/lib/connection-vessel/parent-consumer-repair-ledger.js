//B"H
// Boruch Hashem
// Blessed is He

const IO = require("./mailbox-io.js");
const State = require("./parent-consumer-repair-ledger-state.js");

const DEFAULT_COOLDOWN_MS = 90000;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_REPAIRS = 4;
/**
 * Item 25 — per-signature cooldown multiplier: a signature that just fired must
 * not re-fire immediately even when the global budget allows, otherwise a flap
 * alternating signatures could claim every 90s indefinitely without ever hitting
 * the window cap. Phantom/refunded claims never arm it.
 */
const SIGNATURE_COOLDOWN_MULTIPLIER = 3;

/**
 * @file Persists bounded consumer-repair claims with exact parent identity.
 * @description
 * The Awtsmoos lets memory carry the ordinary tide while durable Gevurah guards the gate;
 * Awtsmoos.com writes PID, birth, and generation before destructive force may contemplate.
 * A nameless target earns no claim, so old receipts cannot command a newly created fate.
 * Claims settle as proven or phantom: only proven repairs consume the bounded budget,
 * while phantom claims are unremembered so a repair that never ran burns no protection.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const file = options.file || State.ledgerPath();
	const cooldownMs = bounded(options.cooldownMs, DEFAULT_COOLDOWN_MS, 10000);
	const signatureCooldownMs = bounded(
		options.signatureCooldownMs,
		cooldownMs * SIGNATURE_COOLDOWN_MULTIPLIER,
		cooldownMs
	);
	const windowMs = bounded(options.windowMs, DEFAULT_WINDOW_MS, cooldownMs);
	const maxRepairs = boundedCount(options.maxRepairs, DEFAULT_MAX_REPAIRS);
	let cached = State.normalized(State.read(file), now(), windowMs);

	/**
	 * Claims one durable repair opportunity for one exact parent generation.
	 * Gates, in order: exact identity, global cooldown, per-signature cooldown
	 * (item 25), window cap. With {evaluateOnly:true} (item 29 dry-run) the exact
	 * same gates run but nothing is written and the cached history is untouched —
	 * the write is the action boundary.
	 */
	function claim(reason = "execution_consumer_stalled", identity = null, opts = {}) {
		const observedAt = now();
		cached = State.normalized(State.read(file), observedAt, windowMs);
		const sinceLastRepairMs = cached.lastRepairAt
			? Math.max(0, observedAt - cached.lastRepairAt)
			: Number.POSITIVE_INFINITY;
		const nextEntry = State.entry(observedAt, reason, identity);
		if (!nextEntry.identity) {
			return outcome(false, "repair_identity_unavailable", cached, sinceLastRepairMs, null, null);
		}
		if (sinceLastRepairMs < cooldownMs) {
			return outcome(false, "repair_cooldown", cached, sinceLastRepairMs, null, null);
		}
		const sinceSignatureMs = sinceLastSignatureMs(cached, String(reason || ""));
		if (sinceSignatureMs < signatureCooldownMs) {
			return outcome(
				false, "repair_signature_cooldown", cached, sinceLastRepairMs,
				null, null, sinceSignatureMs
			);
		}
		if (cached.history.length >= maxRepairs) {
			return outcome(false, "repair_rate_limited", cached, sinceLastRepairMs, null, null);
		}
		if (opts && opts.evaluateOnly === true) {
			// Dry-run: report the exact claim that WOULD be issued, changing nothing.
			return outcome(true, "repair_claimed", cached, 0, nextEntry.identity, nextEntry.claimId, null, true);
		}
		cached = {
			version: 1,
			lastRepairAt: observedAt,
			history: [...cached.history, nextEntry]
		};
		IO.atomicWrite(file, `${JSON.stringify(cached)}\n`);
		return outcome(true, "repair_claimed", cached, 0, nextEntry.identity, nextEntry.claimId);
	}

	/**
	 * Item 25: milliseconds since the last budget-consuming claim of one exact
	 * signature. Counts proven + claimed(unresolved) entries; phantom/refunded
	 * entries never arm the cooldown (settle() removes phantoms from history, and
	 * the state check below is defensive against any future "refunded" state).
	 */
	function sinceLastSignatureMs(state, reason) {
		let latest = -1;
		for (const item of state.history || []) {
			if (!item || String(item.reason || "") !== reason) continue;
			const entryState = String(item.state || "claimed");
			if (entryState === "phantom" || entryState === "refunded") continue;
			latest = Math.max(latest, Number(item.at || 0));
		}
		return latest < 0 ? Number.POSITIVE_INFINITY : Math.max(0, now() - latest);
	}

	/**
	 * Settles one claimed repair as proven or phantom.
	 * A proven entry keeps consuming budget; a phantom entry is removed, refunding
	 * both budget and cooldown testimony, because the repair never executed.
	 * Unknown claim ids, unknown outcomes, and repeated settlements are no-ops.
	 * A claimed entry that never settles (crash before settle) keeps counting:
	 * storm protection must not depend on the settler staying alive.
	 */
	function settle(claimId, result = "proven") {
		if (typeof claimId !== "string" || !claimId) return { settled: false, reason: "unknown_claim" };
		const verdict = result === "proven" ? "proven" : result === "phantom" ? "phantom" : null;
		if (!verdict) return { settled: false, reason: "unknown_outcome" };
		const observedAt = now();
		cached = State.normalized(State.read(file), observedAt, windowMs);
		const index = cached.history.findIndex(item => item && item.claimId === claimId);
		if (index < 0) return { settled: false, reason: "unknown_claim" };
		if (cached.history[index].state === State.CLAIM_STATE_PROVEN) {
			return { settled: false, reason: "already_settled" };
		}
		if (verdict === "proven") {
			const history = cached.history.map((item, position) =>
				(position === index ? { ...item, state: State.CLAIM_STATE_PROVEN } : item)
			);
			cached = { version: 1, lastRepairAt: cached.lastRepairAt, history };
		} else {
			const history = cached.history.filter((item, position) => position !== index);
			const lastRepairAt = history.reduce(
				(latest, item) => Math.max(latest, Number(item.at || 0)),
				0
			);
			cached = { version: 1, lastRepairAt, history };
		}
		IO.atomicWrite(file, `${JSON.stringify(cached)}\n`);
		return { settled: true, outcome: verdict, claimId };
	}

	/** Returns memory-backed ledger testimony without polling disk. */
	function status() {
		cached = State.normalized(cached, now(), windowMs);
		return State.snapshot(cached);
	}

	return { claim, settle, status };
}

/** Builds one compact authorization result while preserving exact identity only on success. */
function outcome(allowed, reason, state, sinceLastRepairMs, identity, claimId, sinceSignatureMs = null, evaluateOnly = false) {
	return {
		allowed,
		reason,
		sinceLastRepairMs,
		sinceSignatureMs,
		lastRepairAt: state.lastRepairAt || 0,
		recentRepairs: state.history.length,
		claimId: allowed && claimId ? claimId : null,
		identity: allowed && identity ? { ...identity } : null,
		evaluateOnly: evaluateOnly === true
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
	SIGNATURE_COOLDOWN_MULTIPLIER,
	create,
	ledgerPath: State.ledgerPath,
	normalized: State.normalized
};
