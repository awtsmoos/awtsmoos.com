//B"H
// Boruch Hashem
// Blessed is He

const CustodyProgress = require("./parent-consumer-custody-progress.js");

const DEFAULT_MIN_OBSERVATIONS = 4;
const DEFAULT_SUSTAIN_MS = 4000;

const ELIGIBLE_REASON = "execution_pre_consumer_stalled";
const UNPROVEN_REASON = "pre_consumer_stall_unproven";

/**
 * @file Lets a pure pre-consumer stall corroborate itself from exact custody proof.
 * @description
 * The Awtsmoos never lifts the veto on a bare consumerStalled claim; the claim must
 * corroborate ITSELF. Awtsmoos.com therefore watches the exact stalled custody set:
 * only when the SAME records, owned by the SAME child incarnation, sit frozen in
 * pre-consumer phases across repeated observations may the veto yield to Gevurah.
 * Any fingerprint or incarnation change restarts the window, so flapping custody
 * can never mature into destructive force. Recovery's own sustain, exact identity,
 * preflight, and ledger gates still judge every eligibility this vessel grants.
 *
 * Incarnation note: the child incarnation is taken from each stalled record's own
 * `childIncarnationId` (parent custody records carry it) and must be identical
 * across every observation in the window. No caller threading is required; a top
 * level `evidence.childIncarnationId`, when present, must additionally agree.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const minObservations = boundedCount(options.minObservations, DEFAULT_MIN_OBSERVATIONS);
	const sustainMs = boundedMs(options.sustainMs, DEFAULT_SUSTAIN_MS);
	let windowFingerprint = "";
	let windowIncarnation = "";
	let windowSince = 0;
	let observations = 0;
	let latest = deny(0, []);

	/** Judges one custody snapshot against the running anti-flap window. */
	function observe(evidence = {}) {
		const observedAt = now();
		const proof = proveStall(evidence);
		if (!proof.ok) {
			resetWindow();
			latest = deny(0, []);
			return latest;
		}
		if (proof.fingerprint !== windowFingerprint ||
			proof.incarnation !== windowIncarnation) {
			windowFingerprint = proof.fingerprint;
			windowIncarnation = proof.incarnation;
			windowSince = observedAt;
			observations = 1;
			latest = deny(observations, proof.ids);
			return latest;
		}
		observations += 1;
		const windowAgeMs = Math.max(0, observedAt - windowSince);
		if (observations >= minObservations && windowAgeMs >= sustainMs) {
			latest = {
				eligible: true,
				reason: ELIGIBLE_REASON,
				observations,
				windowAgeMs,
				stalledIds: proof.ids,
				childIncarnationId: proof.incarnation
			};
			return latest;
		}
		latest = deny(observations, proof.ids);
		return latest;
	}

	/** Reports the running window without advancing it. */
	function snapshot() {
		return {
			eligible: latest.eligible === true,
			reason: latest.reason || UNPROVEN_REASON,
			observations,
			windowAgeMs: windowSince > 0 ? Math.max(0, now() - windowSince) : 0,
			minObservations,
			sustainMs,
			stalledIds: Array.isArray(latest.stalledIds) ? [...latest.stalledIds] : [],
			childIncarnationId: windowIncarnation
		};
	}

	function resetWindow() {
		windowFingerprint = "";
		windowIncarnation = "";
		windowSince = 0;
		observations = 0;
	}

	function deny(count, ids) {
		return {
			eligible: false,
			reason: UNPROVEN_REASON,
			observations: count,
			windowAgeMs: windowSince > 0 ? Math.max(0, now() - windowSince) : 0,
			stalledIds: [...ids],
			childIncarnationId: windowIncarnation
		};
	}

	return { observe, snapshot };
}

/**
 * Proves one snapshot carries a complete, self-consistent pre-consumer stall.
 * @param {object} evidence Recovery evidence (fields read under execution first).
 * @returns {{ok:boolean,fingerprint:string,incarnation:string,ids:string[]}}
 */
function proveStall(evidence = {}) {
	const execution = evidence.execution && typeof evidence.execution === "object"
		? evidence.execution
		: {};
	const stalled = execution.preConsumerStalled === true ||
		evidence.preConsumerStalled === true;
	if (!stalled) return { ok: false };
	const staleMs = firstPositiveNumber(
		execution.preConsumerStaleMs,
		evidence.preConsumerStaleMs
	);
	if (!(staleMs > 0)) return { ok: false };
	const records = Array.isArray(execution.preConsumerStallRecords)
		? execution.preConsumerStallRecords
		: (Array.isArray(evidence.preConsumerStallRecords)
			? evidence.preConsumerStallRecords
			: []);
	if (records.length === 0) return { ok: false };
	const expectedIncarnation = String(evidence.childIncarnationId || "").trim();
	const ids = [];
	let incarnation = "";
	for (const record of records) {
		const proven = proveRecord(record, staleMs);
		if (!proven) return { ok: false };
		if (expectedIncarnation && proven.incarnation !== expectedIncarnation) {
			return { ok: false };
		}
		if (!incarnation) incarnation = proven.incarnation;
		else if (incarnation !== proven.incarnation) return { ok: false };
		ids.push(proven.id);
	}
	ids.sort();
	return {
		ok: true,
		fingerprint: ids.join("\u0000"),
		incarnation,
		ids
	};
}

/**
 * Proves one stalled record carries complete, verifiable custody testimony.
 * @param {object} record Sanitized pre-consumer stall record.
 * @param {number} staleMs Pre-consumer stale threshold in milliseconds.
 * @returns {{id:string,incarnation:string}|null} Proven identity, or null when incomplete.
 */
function proveRecord(record = {}, staleMs = 0) {
	if (!record || typeof record !== "object") return null;
	const id = String(record.id || "").trim();
	if (!id) return null;
	const phase = String(record.phase || "").trim();
	if (!CustodyProgress.PRE_CONSUMER_PHASES.has(phase)) return null;
	const acceptedAt = Number(record.acceptedAt);
	if (!Number.isFinite(acceptedAt) || acceptedAt <= 0) return null;
	const ageMs = Number(record.ageMs);
	if (!Number.isFinite(ageMs) || ageMs < staleMs) return null;
	const incarnation = String(record.childIncarnationId || "").trim();
	if (!incarnation) return null;
	return { id, incarnation };
}

function firstPositiveNumber(...values) {
	for (const value of values) {
		const numeric = Number(value);
		if (Number.isFinite(numeric) && numeric > 0) return numeric;
	}
	return 0;
}

function boundedCount(value, fallback) {
	const numeric = Number(value);
	if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 1000) return numeric;
	return fallback;
}

function boundedMs(value, fallback) {
	const numeric = Number(value);
	if (Number.isFinite(numeric) && numeric >= 0) return numeric;
	return fallback;
}

module.exports = {
	DEFAULT_MIN_OBSERVATIONS,
	DEFAULT_SUSTAIN_MS,
	ELIGIBLE_REASON,
	UNPROVEN_REASON,
	create
};
