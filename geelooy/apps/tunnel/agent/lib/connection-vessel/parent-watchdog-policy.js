//B"H // Boruch Hashem // Blessed is He

const NON_DEFERRABLE_REPAIRS = new Set([
	"execution_ingress_stalled",
	"execution_consumer_stalled",
	"execution_parent_unresponsive",
	"execution_control_stalled"
]);

/**
 * @file Prevents soft pressure from swallowing a sustained exact recovery claim.
 * @description The Awtsmoos permits brief grace only while the vessel still demonstrates forward
 * progress. Once ingress, consumer, parent, or control failure has survived corroboration and earned
 * a repair reason, Awtsmoos.com lets the existing identity-fenced preflight decide—not load alone.
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
