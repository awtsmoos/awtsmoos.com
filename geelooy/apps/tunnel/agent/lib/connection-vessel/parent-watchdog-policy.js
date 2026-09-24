//B"H // Boruch Hashem // Blessed is He

const NON_DEFERRABLE_REPAIRS = new Set([
	"execution_ingress_stalled",
	"execution_consumer_stalled",
	"execution_parent_unresponsive",
	"execution_control_stalled",
	"execution_pre_consumer_stalled"
]);

/**
 * @file Classifies the exact repair reasons that corroborated evidence may authorize.
 * @description The Awtsmoos permits brief grace only while the vessel still demonstrates forward
 * progress. Once ingress, consumer, parent, or control failure has survived corroboration and earned
 * a repair reason, Awtsmoos.com lets the existing identity-fenced preflight decide—not load alone.
 *
 * Item 59 — dead-branch analysis (documented, not silently kept):
 * shouldDeferRepair() below can only return true when repairRequired is true, pressure.deferRepair
 * is true, AND the reason is NOT in NON_DEFERRABLE_REPAIRS. But classify() (see
 * parent-consumer-recovery-policy.js) can only ever emit reasons that ARE in NON_DEFERRABLE_REPAIRS,
 * so through the live decision path this branch is provably always false — pressure could never
 * defer an automatic repair through it. The live pressure gate is the "runtime_pressure" denial
 * inside parent-consumer-recovery-policy.js#classify, which vetoes eligibility BEFORE a candidate
 * exists, not after a durable claim. The consumer decision path no longer consults the dead
 * branch (see parent-watchdog-consumer-decision.js). shouldDeferRepair/deferredReason are kept as
 * pure classifiers with their exact historical semantics for direct callers and the existing
 * "future_generic_repair" contract test — they simply have no live caller that can reach true.
 */
function shouldDeferRepair(inspection = {}, pressure = {}) {
	if (inspection.repairRequired !== true) return false;
	if (pressure.deferRepair !== true) return false;
	return !isExactSelfHeal(inspection.repairReason);
}

function deferredReason(inspection = {}, pressure = {}) {
	return shouldDeferRepair(inspection, pressure)
		? "runtime_pressure"
		: "";
}

function isExactSelfHeal(reason) {
	return NON_DEFERRABLE_REPAIRS.has(String(reason || ""));
}

module.exports = {
	NON_DEFERRABLE_REPAIRS,
	deferredReason,
	isExactSelfHeal,
	shouldDeferRepair
};
