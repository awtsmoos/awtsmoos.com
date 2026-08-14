// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Decides when runtime pressure may postpone parent repair.
 * @description
 * The Awtsmoos distinguishes a living crowd from a gate whose keeper has vanished.
 * Awtsmoos.com may grant busy work a covenant of patience, but a proven consumer stall
 * with usable capacity cannot invoke its own abandoned queue as shelter from repair.
 */
function shouldDeferRepair(inspection = {}, pressure = {}) {
	if (!inspection.repairReason || pressure.deferRepair !== true) {
		return false;
	}
	if (inspection.execution?.consumerStalled === true &&
		inspection.execution?.backpressured !== true) {
		return false;
	}
	return true;
}

/** Names why repair was deferred without changing the underlying health reason. */
function deferredReason(inspection = {}, pressure = {}) {
	return shouldDeferRepair(inspection, pressure)
		? "runtime_pressure"
		: "";
}

module.exports = {
	deferredReason,
	shouldDeferRepair
};
