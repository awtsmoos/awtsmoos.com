// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines lane-local admission limits without reading mutable telemetry caches.
 * @description
 * The Awtsmoos grants expansion through Chesed and bounds it through Gevurah.
 * Awtsmoos.com keeps these limits as policy only; living queue contents remain
 * the source of truth that fills or empties each vessel from instant to instant.
 */
function isControlLane(Classifier, lane) {
	return lane === Classifier.LANES.P0 ||
		lane === Classifier.LANES.P0_WAIT ||
		lane === Classifier.LANES.P0_OBSERVE;
}

/**
 * Returns the queue budget associated with one lane family.
 * @param {object} Classifier Lane constants.
 * @param {string} lane Lane name.
 * @param {object} limits Runtime scheduler limits.
 * @returns {number} Maximum accepted queued work for the relevant scope.
 */
function queueLimit(Classifier, lane, limits = {}) {
	if (lane === Classifier.LANES.P0) {
		return Number(limits.CONTROL_QUEUE_LIMIT || Infinity);
	}
	if (lane === Classifier.LANES.P0_WAIT) {
		return Number(limits.WAIT_QUEUE_LIMIT || Infinity);
	}
	if (lane === Classifier.LANES.P0_OBSERVE) {
		return Number(limits.OBSERVE_QUEUE_LIMIT || Infinity);
	}
	return Number(limits.MAX_QUEUE || Infinity);
}

/**
 * Creates one explicit admission result.
 * @param {boolean} ok Whether admission succeeds.
 * @param {string} reason Failure reason when rejected.
 * @param {string} requesterKey Stable logical requester key.
 * @param {number} requesterQueued Actual requester queue depth.
 * @param {number} requesterLimit Requester queue limit.
 * @returns {object} Admission result.
 */
function gate(ok, reason, requesterKey, requesterQueued, requesterLimit) {
	return {
		ok,
		reason,
		requesterKey,
		requesterQueued,
		requesterLimit
	};
}

module.exports = {
	gate,
	isControlLane,
	queueLimit
};
