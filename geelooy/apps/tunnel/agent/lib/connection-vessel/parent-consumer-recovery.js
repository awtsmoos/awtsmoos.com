// B"H
// Boruch Hashem
// Blessed is He

const RepairLedger = require("./parent-consumer-repair-ledger.js");
const Policy = require("./parent-consumer-recovery-policy.js");

const DEFAULT_SUSTAIN_MS = 4000;
const DEFAULT_MIN_OBSERVATIONS = 4;

/**
 * @file Accumulates sustained consumer-stall testimony before one durable repair claim.
 * @description
 * The Awtsmoos lets a transient pause dissolve without force. Awtsmoos.com requires
 * repeated corroborated silence across measured time, then asks the durable repair
 * ledger once and resets the candidate whether the claim is allowed or rate-limited.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const sustainMs = bounded(options.sustainMs, DEFAULT_SUSTAIN_MS, 1000);
	const minimumObservations = boundedCount(
		options.minimumObservations,
		DEFAULT_MIN_OBSERVATIONS
	);
	const ledger = options.ledger || RepairLedger.create(options.ledgerOptions);
	let candidateSince = 0;
	let observations = 0;
	let latest = idle("consumer_healthy");

	/**
	 * Observes one child-side execution snapshot and claims repair only after sustained proof.
	 * @param {object} evidence Execution, pressure, parent, and control evidence.
	 * @returns {object} Current candidate/authorization state.
	 */
	function observe(evidence = {}) {
		const observedAt = now();
		const eligibility = Policy.classify(evidence);
		if (!eligibility.eligible) {
			reset(eligibility.reason);
			return latest;
		}
		if (!candidateSince) candidateSince = observedAt;
		observations += 1;
		const ageMs = Math.max(0, observedAt - candidateSince);
		if (ageMs < sustainMs || observations < minimumObservations) {
			latest = status(false, eligibility.reason, ageMs, null);
			return latest;
		}
		const claim = ledger.claim(eligibility.reason);
		latest = status(claim.allowed, claim.reason, ageMs, claim);
		resetCandidate();
		return latest;
	}

	/** Returns memory-backed recovery testimony without touching disk. */
	function snapshot() {
		return {
			...latest,
			candidateSince,
			observations,
			sustainMs,
			minimumObservations,
			ledger: ledger.status()
		};
	}

	function reset(reason) {
		resetCandidate();
		latest = idle(reason);
	}

	function resetCandidate() {
		candidateSince = 0;
		observations = 0;
	}

	return { observe, snapshot };
}

function idle(reason) {
	return status(false, reason, 0, null);
}

function status(repairAuthorized, reason, candidateAgeMs, claim) {
	return { repairAuthorized, reason, candidateAgeMs, claim };
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
		? Math.max(2, Math.min(20, Math.floor(number)))
		: fallback;
}

module.exports = {
	DEFAULT_MIN_OBSERVATIONS,
	DEFAULT_SUSTAIN_MS,
	create
};
