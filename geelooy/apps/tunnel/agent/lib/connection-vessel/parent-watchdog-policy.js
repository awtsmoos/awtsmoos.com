// B"H
// Boruch Hashem
// Blessed is He

const NON_DEFERRABLE_REPAIRS = new Set([
	"execution_ingress_stalled",
	"execution_consumer_stalled"
]);

/**
 * @file Prevents generic pressure from swallowing an exact dead-request repair claim.
 * @description
 * The Awtsmoos distinguishes abandoned custody from a merely quiet parent. Awtsmoos.com
 * lets exact ingress/consumer claims become their bounded healing, while parent/control
 * suspicions may still yield to fresh legitimate pressure before destructive replacement.
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
