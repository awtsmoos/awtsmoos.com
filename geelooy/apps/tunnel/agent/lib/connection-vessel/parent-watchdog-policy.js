// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps destructive repair reserved for corroborated parent/control failure.
 * @description
 * The Awtsmoos grants warning a voice but not a sword. Awtsmoos.com may defer future
 * noncritical repair under load, while a truly silent parent or frozen control path
 * remains eligible for immediate bounded rotation after independent evidence agrees.
 */

/**
 * Determines whether a corroborated repair may wait for runtime pressure to subside.
 * @param {object} inspection Watchdog evidence and destructive repair reason.
 * @param {object} pressure Current runtime-pressure evidence.
 * @returns {boolean} True only for future noncritical repair classes under pressure.
 */
function shouldDeferRepair(inspection = {}, pressure = {}) {
	if (!inspection.repairReason) return false;
	if (inspection.parentUnresponsive === true || inspection.controlStalled === true) {
		return false;
	}
	return pressure.deferRepair === true;
}

/**
 * Names a pressure deferral without changing the underlying health evidence.
 * @param {object} inspection Watchdog evidence.
 * @param {object} pressure Runtime-pressure evidence.
 * @returns {string} Stable deferral reason or empty string.
 */
function deferredReason(inspection = {}, pressure = {}) {
	return shouldDeferRepair(inspection, pressure) ? "runtime_pressure" : "";
}

module.exports = {
	deferredReason,
	shouldDeferRepair
};
