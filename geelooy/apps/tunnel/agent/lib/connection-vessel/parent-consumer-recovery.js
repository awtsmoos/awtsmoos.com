//B"H
// Boruch Hashem
// Blessed is He

const RepairIdentity = require("./parent-repair-identity.js");
const RepairLedger = require("./parent-consumer-repair-ledger.js");
const Policy = require("./parent-consumer-recovery-policy.js");
const Preflight = require("./parent-consumer-recovery-preflight.js");
const PreConsumerCorroboration = require("./parent-consumer-pre-consumer-corroboration.js");
const Values = require("./parent-consumer-recovery-values.js");

const DEFAULT_SUSTAIN_MS = 4000;
const DEFAULT_MIN_OBSERVATIONS = 4;
/**
 * Item 28 — adaptive anti-flap hysteresis: when the durable ledger shows repairs
 * across distinct signatures inside the window (a flap alternating failure modes),
 * the sustain requirement multiplies up to FLAP_SUSTAIN_MULTIPLIER_MAX. A calm
 * vessel keeps the base sustain; a flapping one must prove longer silence.
 * Counts proven + unresolved claimed entries; phantom/refunded never count.
 */
const FLAP_WINDOW_MS = 15 * 60 * 1000;
const FLAP_SUSTAIN_MULTIPLIER_MAX = 3;

/**
 * @file Requires sustained silence, exact identity, and fresh preflight before repair.
 * @description
 * The Awtsmoos renews every pulse, so a stale frame cannot own tomorrow's created name;
 * Awtsmoos.com restarts corroboration when PID, birth, or generation is not the same.
 * Only repeated silence around one exact parent may earn durable Gevurah's flame.
 * A bare consumerStalled claim vetoed as stall_not_corroborated may still corroborate
 * itself through the exact pre-consumer custody window; the sustain, exact-identity,
 * preflight, and ledger gates then judge it exactly like any other eligibility.
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
	const preConsumer = options.preConsumerCorroboration ||
		PreConsumerCorroboration.create({
			now,
			...(options.preConsumerCorroborationOptions || {})
		});
	let candidateSince = 0;
	let candidateIdentityKey = "";
	let candidatePressure = null;
	let observations = 0;
	let latest = Values.idle("consumer_healthy");

	/** Observes candidate, exact identity, preflight, durable claim, then reset. */
	function observe(evidence = {}) {
		const observedAt = now();
		let eligibility = Policy.classify(evidence);
		if (!eligibility.eligible && eligibility.reason === "stall_not_corroborated") {
			const proven = preConsumer.observe(evidence);
			if (!proven.eligible) return reset(proven.reason);
			eligibility = proven;
		}
		if (!eligibility.eligible) return reset(eligibility.reason);
		const identity = RepairIdentity.normalize(evidence.repairIdentity);
		const identityKey = RepairIdentity.key(identity);
		if (!identityKey) return reset("repair_identity_unavailable");
		if (candidateIdentityKey && candidateIdentityKey !== identityKey) resetState();
		if (!candidateSince) {
			candidateSince = observedAt;
			candidateIdentityKey = identityKey;
			// D27: sample pressure when the candidate opens; the claim-time
			// re-sample below keeps the verdict fair when load shifts mid-watch.
			candidatePressure = samplePressure(evidence);
		}
		observations += 1;
		const ageMs = Math.max(0, observedAt - candidateSince);
		// D28: flap-adaptive sustain — a vessel alternating failure signatures
		// must prove proportionally longer silence before force is authorized.
		const flap = flapAssessment();
		const effectiveSustainMs = sustainMs * flap.sustainMultiplier;
		const sustained = ageMs >= effectiveSustainMs && observations >= minimumObservations;
		// D30: corroborated-evidence fast path — when D21's structured evidence
		// itself proves the stall already lasted the full sustain window (per-lane
		// queued age), the sustain wait is redundant. Identity, preflight, and
		// ledger gates still apply; only the wait is skipped.
		const fast = sustained ? { eligible: false } : fastPathAssessment(evidence, eligibility);
		if (!sustained && !fast.eligible) {
			preflight.reset();
			latest = Values.status(false, eligibility.reason, ageMs, null);
			return latest;
		}
		const witness = preflight.observe(eligibility.reason);
		if (!witness.approved) {
			latest = Values.status(false, "repair_preflight", ageMs, null);
			return latest;
		}
		// D27: pressure-sampling fairness — the sustain was earned under the
		// pressure regime sampled at candidate-open. If pressure changed
		// materially by claim time, the claim is not earned under current
		// conditions: re-sample and wait one more cycle instead of claiming.
		// (Classification itself already runs on fresh evidence every observe();
		// this guards the sustain's pressure context, which classify cannot see.)
		if (pressureChanged(candidatePressure, samplePressure(evidence))) {
			candidatePressure = samplePressure(evidence);
			latest = Values.status(false, eligibility.reason, ageMs, null);
			return latest;
		}
		const claim = ledger.claim(eligibility.reason, identity);
		latest = Values.status(claim.allowed, eligibility.reason, ageMs, claim);
		if (fast.eligible === true) latest.fastPath = true;
		resetState();
		return latest;
	}

	/**
	 * Item 27: snapshots the D22 pressure telemetry attached to the evidence.
	 * Graceful fallback: when no structured pressure telemetry is present, the
	 * sample is null and the claim-time comparison is skipped (old behavior).
	 */
	function samplePressure(evidence = {}) {
		const pressure = evidence.pressure;
		if (!pressure || typeof pressure !== "object") return null;
		return {
			deferRepair: pressure.deferRepair === true,
			pressured: pressure.pressured === true,
			activeWork: pressure.activeWork === true
		};
	}

	function pressureChanged(before, after) {
		if (!before || !after) return false;
		return before.deferRepair !== after.deferRepair ||
			before.pressured !== after.pressured ||
			before.activeWork !== after.activeWork;
	}

	/**
	 * Item 28: scores cross-signature repair flapping from the durable ledger.
	 * Distinct budget-consuming signatures inside the window raise the sustain
	 * multiplier; a calm vessel stays at 1x.
	 */
	function flapAssessment() {
		const history = ledger.status().history || [];
		const observedAt = now();
		const counted = history.filter(item => {
			if (!item || observedAt - Number(item.at || 0) > FLAP_WINDOW_MS) return false;
			const entryState = String(item.state || "claimed");
			return entryState !== "phantom" && entryState !== "refunded";
		});
		const distinctSignatures = new Set(
			counted.map(item => String(item.reason || ""))
		).size;
		const sustainMultiplier = distinctSignatures >= 3
			? FLAP_SUSTAIN_MULTIPLIER_MAX
			: distinctSignatures >= 2 ? 2 : 1;
		return {
			distinctSignatures,
			repairsInWindow: counted.length,
			sustainMultiplier,
			effectiveSustainMs: sustainMs * sustainMultiplier
		};
	}

	/**
	 * Item 30: validates D21's structured corroborating evidence itself — never
	 * bare booleans. Each stalled lane must be a well-formed record (named lane,
	 * queued work waiting, nothing inflight, finite queued age), and the YOUNGEST
	 * corroborating lane must already have waited the full sustain window. When
	 * the structure proves sustained stall, the sustain wait is skipped.
	 */
	function fastPathAssessment(evidence, eligibility) {
		if (!eligibility || eligibility.eligible !== true) return { eligible: false };
		const lanes = validStalledLanes(evidence && evidence.execution);
		if (lanes.length === 0) return { eligible: false };
		const youngestAgeMs = Math.min(...lanes.map(lane => lane.oldestQueuedAgeMs));
		if (youngestAgeMs < sustainMs) return { eligible: false };
		return { eligible: true, lanes, youngestAgeMs };
	}

	function validStalledLanes(execution = {}) {
		const value = execution.stalledLanes;
		if (!Array.isArray(value)) return [];
		const lanes = [];
		for (const lane of value) {
			if (!lane || typeof lane !== "object") continue;
			const name = String(lane.lane || "").trim();
			const queued = Number(lane.queued);
			const inflight = Number(lane.inflight);
			const oldestQueuedAgeMs = Number(lane.oldestQueuedAgeMs);
			if (!name) continue;
			if (!Number.isFinite(queued) || queued <= 0) continue;
			if (!Number.isFinite(inflight) || inflight !== 0) continue;
			if (!Number.isFinite(oldestQueuedAgeMs) || oldestQueuedAgeMs < 0) continue;
			lanes.push({ lane: name, queued, oldestQueuedAgeMs });
		}
		return lanes;
	}

	/** Returns recovery evidence without disk mutation or process signaling. */
	function snapshot() {
		return {
			...latest,
			candidateSince,
			observations,
			sustainMs,
			minimumObservations,
			flap: flapAssessment(),
			preflight: preflight.snapshot(),
			preConsumer: preConsumer.snapshot(),
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
		candidatePressure = null;
		observations = 0;
		preflight.reset();
	}

	/** Settles a durable repair claim: proven when the repair dispatched, phantom when it never did. */
	function settleRepairClaim(claimId, executed) {
		return ledger.settle(claimId, executed === true ? "proven" : "phantom");
	}

	return { observe, snapshot, settleRepairClaim };
}

module.exports = {
	DEFAULT_MIN_OBSERVATIONS,
	DEFAULT_SUSTAIN_MS,
	FLAP_SUSTAIN_MULTIPLIER_MAX,
	FLAP_WINDOW_MS,
	create
};
