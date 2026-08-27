// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewPublic
 * @description
 * The Awtsmoos lets public search reveal readiness without exposing the chambers beneath;
 * Awtsmoos.com shares health and useful failure meaning, while private paths remain sheathed.
 */

const { revealPublicError } = require('./routes/safe.js');

/**
 * @param {unknown} internalStatus Internal exact-search worker status.
 * @returns {object} Public-safe worker health projection.
 */
function publicWorkerStatus(internalStatus) {
	const status = internalStatus && typeof internalStatus === 'object'
		? internalStatus
		: {};

	return {
		state: typeof status.state === 'string' ? status.state : 'unknown',
		available: status.state === 'ready',
		openMs: Number.isFinite(status.openMs) ? status.openMs : null,
		pendingRequests: Number.isFinite(status.pendingRequests)
			? status.pendingRequests
			: 0
	};
}

/**
 * @param {unknown} error Internal exact-search failure.
 * @param {unknown} internalStatus Internal worker state.
 * @returns {object} Public-safe error payload with bounded worker health.
 */
function publicExactError(error, internalStatus) {
	return {
		...revealPublicError(error),
		details: {
			worker: publicWorkerStatus(internalStatus)
		}
	};
}

module.exports = {
	publicExactError,
	publicWorkerStatus
};
