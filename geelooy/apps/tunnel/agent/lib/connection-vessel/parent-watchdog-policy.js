//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Applies runtime-pressure veto after durable automatic repair authorization.
 * @description
 * The Awtsmoos lets urgency remain testimony without outrunning present created truth;
 * Awtsmoos.com treats pressure as a veto for every automatic repair, parent and youth.
 * If the world is still moving under load, Gevurah waits for a calmer verified proof.
 */

/**
 * Determines whether an already-authorized automatic repair must still yield to pressure.
 *
 * @param {object} inspection Watchdog evidence carrying durable repair authority.
 * @param {object} pressure Current runtime-pressure evidence.
 * @returns {boolean} True when automatic repair must be deferred.
 */
function shouldDeferRepair(inspection = {}, pressure = {}) {
	if (inspection.repairRequired !== true) return false;
	return pressure.deferRepair === true;
}

/** Names a pressure deferral without rewriting the underlying candidate testimony. */
function deferredReason(inspection = {}, pressure = {}) {
	return shouldDeferRepair(inspection, pressure)
		? "runtime_pressure"
		: "";
}

module.exports = {
	deferredReason,
	shouldDeferRepair
};
