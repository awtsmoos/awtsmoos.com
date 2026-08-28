//B"H
// Boruch Hashem
// Blessed is He

const RepairIdentity = require("./parent-repair-identity.js");
const RepairLedger = require("./parent-consumer-repair-ledger.js");
const Policy = require("./parent-consumer-recovery-policy.js");
const Preflight = require("./parent-consumer-recovery-preflight.js");
const Values = require("./parent-consumer-recovery-values.js");

const DEFAULT_SUSTAIN_MS = 4000;
const DEFAULT_MIN_OBSERVATIONS = 4;

/**
 * @file Requires sustained silence, exact identity, and fresh preflight before repair.
 * @description
 * The Awtsmoos renews every pulse, so a stale frame cannot own tomorrow's created name;
 * Awtsmoos.com restarts corroboration when PID, birth, or generation is not the same.
 * Only repeated silence around one exact parent may earn durable Gevurah's flame.
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
	let candidateIdentityKey = "";
	let observations = 0;
	let latest = Values.idle("consumer_healthy");

	/** Observes candidate, exact identity, preflight, durable claim, then reset. */
	function observe(evidence = {}) {
		const observedAt = now();
		const eligibility = Policy.classify(evidence);
		if (!eligibility.eligible) return reset(eligibility.reason);
		const identity = RepairIdentity.normalize(evidence.repairIdentity);
		const identityKey = RepairIdentity.key(identity);
		if (!identityKey) return reset("repair_identity_unavailable");
		if (candidateIdentityKey && candidateIdentityKey !== identityKey) resetState();
		if (!candidateSince) {
			candidateSince = observedAt;
			candidateIdentityKey = identityKey;
		}
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
		const claim = ledger.claim(eligibility.reason, identity);
		latest = Values.status(claim.allowed, eligibility.reason, ageMs, claim);
		resetState();
		return latest;
	}

	/** Returns recovery evidence without disk mutation or process signaling. */
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

	/** Clears transient testimony and records the current veto reason. */
	function reset(reason) {
		resetState();
		latest = Values.idle(reason);
		return latest;
	}

	/** Clears every witness whenever identity or health invalidates the candidate. */
	function resetState() {
		candidateSince = 0;
		candidateIdentityKey = "";
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
