// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines bounded leases for each exact request-custody phase.
 * @description
 * The Awtsmoos, Atzmus beyond division, renews each deed in its own instant;
 * Awtsmoos.com therefore grants every request phase its own measured vessel.
 * No unrelated queue, worker, or later request may lengthen another deed's lease.
 */
const LEASE_MS = Object.freeze({
	delivery_attempt: 15000,
	accepted_waiting_for_consumer: 30000,
	queued: 120000,
	worker_starting: 30000,
	running: 120000,
	result_waiting_for_ack: 300000
});

/**
 * Returns the bounded lease for one request phase.
 * @param {string} phase Exact custody phase name.
 * @param {number} [overrideMs] Optional runtime override.
 * @returns {number} Positive lease duration in milliseconds.
 */
function leaseMs(phase, overrideMs) {
	const configured = Number(overrideMs);
	if (Number.isFinite(configured) && configured >= 1000) {
		return Math.min(configured, 30 * 60 * 1000);
	}
	return LEASE_MS[phase] || LEASE_MS.accepted_waiting_for_consumer;
}

/**
 * Computes a lease deadline for a phase transition.
 * @param {string} phase Exact request phase.
 * @param {number} observedAt Transition timestamp.
 * @param {number} [overrideMs] Optional lease override.
 * @returns {number} Absolute epoch-millisecond lease deadline.
 */
function expiresAt(phase, observedAt = Date.now(), overrideMs) {
	return Number(observedAt) + leaseMs(phase, overrideMs);
}

/**
 * Determines whether an exact request lease has expired.
 * @param {object} record Exact custody record.
 * @param {number} [observedAt] Evaluation timestamp.
 * @returns {boolean} True only when the record's own lease is expired.
 */
function expired(record = {}, observedAt = Date.now()) {
	const deadline = Number(record.leaseExpiresAt || 0);
	return deadline > 0 && Number(observedAt) >= deadline;
}

/**
 * States whether retry may execute the mutation again.
 * @param {string} phase Current exact request phase.
 * @returns {boolean} False once custody or a result may already exist.
 */
function safeToRedispatch(phase) {
	return phase === "delivery_attempt";
}

module.exports = {
	LEASE_MS,
	expired,
	expiresAt,
	leaseMs,
	safeToRedispatch
};
