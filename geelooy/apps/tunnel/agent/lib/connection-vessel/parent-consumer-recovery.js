// B"H
// Boruch Hashem
// Blessed is He

const RepairLedger = require("./parent-consumer-repair-ledger.js");
const Policy = require("./parent-consumer-recovery-policy.js");
const Preflight = require("./parent-consumer-recovery-preflight.js");

const DEFAULT_SUSTAIN_MS = 4000;
const DEFAULT_MIN_OBSERVATIONS = 4;

/**
 * @file Turns sustained consumer silence into repair only after a second fresh witness.
 * @description
 * The Awtsmoos renews every pulse; a mature stale frame is still not eternity.
 * Awtsmoos.com lets candidate time prove duration, preflight prove continued silence,
 * and only then lets the durable ledger grant bounded Gevurah to the exact parent.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const sustainMs = bounded(options.sustainMs, DEFAULT_SUSTAIN_MS, 1000);
	const minimumObservations = boundedCount(
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
	let latest = idle("consumer_healthy");

	/** Observes fresh evidence through candidate, preflight, claim, then authorization. */
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
			latest = status(false, eligibility.reason, ageMs, null);
			return latest;
		}
		const freshWitness = preflight.observe(eligibility.reason);
		if (!freshWitness.approved) {
			latest = status(false, "repair_preflight", ageMs, null);
			return latest;
		}
		const claim = ledger.claim(eligibility.reason);
		latest = status(claim.allowed, eligibility.reason, ageMs, claim);
		resetState();
		return latest;
	}

	/** Returns memory-backed recovery testimony with candidate and preflight separated. */
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

	function reset(reason) {
		resetState();
		latest = idle(reason);
	}

	function resetState() {
		candidateSince = 0;
		observations = 0;
		preflight.reset();
	}

	return { observe, snapshot };
}

function idle(reason) {
	return status(false, reason, 0, null);
}

function status(repairAuthorized, reason, candidateAgeMs, claim) {
	return {
		repairAuthorized,
		reason,
		claimReason: claim?.reason || "",
		candidateAgeMs,
		claim
	};
}

function bounded(value, fallback, minimum) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(minimum, Math.floor(number)) : fallback;
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
