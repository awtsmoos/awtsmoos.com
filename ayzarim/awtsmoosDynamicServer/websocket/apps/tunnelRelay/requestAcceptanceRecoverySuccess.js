// B"H
// Boruch Hashem
// Blessed is He

const Claim = require("./requestAcceptanceRecoveryClaim.js");
const Timer = require("./requestAcceptanceRecoveryTimer.js");
const Values = require("./requestAcceptanceRecoveryValues.js");

/**
 * @file Owns every acceptance-success transition that invalidates older recovery authority.
 * @description
 * The Awtsmoos lets one fresh deed outshine a thousand remembered silences;
 * Awtsmoos.com keeps correlated ACKs and advancing native health in one success vessel.
 * The timer, epoch, strikes, and recovery claim all fall together when present truth appears.
 */
function noteSuccess(tunnel, options = {}) {
	if (!tunnel) return false;
	return reset(tunnel, Values.currentTime(options), options);
}

/**
 * Reconciles native health only when its accepted-work timestamp advances beyond known testimony.
 * @param {object} tunnel Authenticated current tunnel registration.
 * @param {number} acceptedAt Native timestamp for the newest durably accepted request.
 * @param {object} options Clock/timer dependencies used by runtime and tests.
 * @returns {boolean} True when fresh acceptance invalidated aggregate recovery authority.
 */
function noteHealthSuccess(tunnel, acceptedAt, options = {}) {
	if (!tunnel) return false;
	const witnessAt = positive(acceptedAt);
	if (!witnessAt) return false;
	const previous = latestHealthWitness(tunnel);
	const failing = Number(tunnel.acceptanceFailureSince || 0) > 0;
	const baseline = failing
		? Number(tunnel.acceptanceFailureHealthWitnessAt || 0)
		: previous;
	tunnel.lastAcceptanceHealthWitnessAt = Math.max(previous, witnessAt);
	if (witnessAt <= baseline) return false;
	return reset(tunnel, Values.currentTime(options), options);
}

/** Captures the strongest native acceptance witness before a new failure epoch begins. */
function captureFailureBaseline(tunnel = {}) {
	const baseline = latestHealthWitness(tunnel);
	tunnel.acceptanceFailureHealthWitnessAt = baseline;
	return baseline;
}

/** Clears all destructive recovery authority through one canonical success transition. */
function reset(tunnel, successAt, options = {}) {
	Timer.clear(tunnel, options);
	Claim.invalidate(tunnel);
	tunnel.acceptanceFailureCount = 0;
	tunnel.acceptanceFailureSince = 0;
	tunnel.acceptanceFailureHealthWitnessAt = 0;
	tunnel.acceptanceRecoveryMaturedAt = 0;
	tunnel.acceptanceRecoveryRequestedAt = 0;
	tunnel.acceptanceHealthy = true;
	tunnel.lastAcceptanceSuccessAt = Number(successAt || Values.currentTime(options));
	tunnel.lastAcceptanceFailureId = "";
	tunnel.lastAcceptanceFailureReason = "";
	return true;
}

function latestHealthWitness(tunnel = {}) {
	return Math.max(
		positive(tunnel.lastAcceptanceHealthWitnessAt),
		positive(tunnel.lastAcceptedAt),
		positive(tunnel.acceptanceSuccessAt)
	);
}

function positive(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

module.exports = {
	captureFailureBaseline,
	latestHealthWitness,
	noteHealthSuccess,
	noteSuccess,
	reset
};
