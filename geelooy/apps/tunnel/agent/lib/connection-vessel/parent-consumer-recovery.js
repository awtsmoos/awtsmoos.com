// B"H
// Boruch Hashem
// Blessed is He

const RepairLedger = require("./parent-consumer-repair-ledger.js");
const Policy = require("./parent-consumer-recovery-policy.js");
const Preflight = require("./parent-consumer-recovery-preflight.js");
const Values = require("./parent-consumer-recovery-values.js");

const DEFAULT_SUSTAIN_MS = 4000;
const DEFAULT_MIN_OBSERVATIONS = 4;

/**
 * @file Requires sustained silence plus one fresh preflight before consumer repair.
 * @description
 * The Awtsmoos renews every pulse, so one mature stale frame is never eternity.
 * Awtsmoos.com first measures corroborated silence, then asks for fresh testimony,
 * and only afterward lets the durable ledger grant bounded repair to the exact parent.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const sustainMs = Values.bounded(options.sustainMs, DEFAULT_SUSTAIN_MS, 1000);
	const minimumObservations = Values.boundedCount(
		options.minimumObservations,
		DEFAULT_MIN_OBSERVATIONS
	);
	const ledger = options.ledger || RepairLedger.create(options.ledgerOptions);
	const preflight = options.preflight || Preflight.create({
		now,
		...(options.preflightOptions || {})
	});
	let candidateSince = 0;
	let observations = 0;
	let latest = Values.idle("consumer_healthy");

	/**
	 * Observes fresh evidence through candidate, preflight, claim, then reset.
	 * @param {object} evidence Execution, pressure, parent, registration, and control evidence.
	 * @returns {object} Current recovery testimony and bounded repair authorization.
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
			preflight.reset();
			latest = Values.status(false, eligibility.reason, ageMs, null);
			return latest;
		}
		const witness = preflight.observe(eligibility.reason);
		if (!witness.approved) {
			latest = Values.status(false, "repair_preflight", ageMs, null);
			return latest;
		}
		const claim = ledger.claim(eligibility.reason);
		latest = Values.status(claim.allowed, eligibility.reason, ageMs, claim);
		resetState();
		return latest;
	}

	/**
	 * Returns recovery evidence without mutating disk or signaling a process.
	 * @returns {object} Candidate, preflight, thresholds, latest decision, and ledger status.
	 */
	function snapshot() {
		return {
			...latest,
			candidateSince,
			observations,
			sustainMs,
			minimumObservations,
			preflight: preflight.snapshot(),
			ledger: ledger.status()
		};
	}

	/** Clears candidate/preflight state and records the current veto reason. */
	function reset(reason) {
		resetState();
		latest = Values.idle(reason);
	}

	/** Clears every transient witness after veto or claim attempt. */
	function resetState() {
		candidateSince = 0;
		observations = 0;
		preflight.reset();
	}

	return { observe, snapshot };
}

module.exports = {
	DEFAULT_MIN_OBSERVATIONS,
	DEFAULT_SUSTAIN_MS,
	create
};
