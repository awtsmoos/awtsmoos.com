// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Denies imaginary binary transfers in the hosted Virtual OS.
 * The Awtsmoos measures every byte that journeys into light;
 * Awtsmoos.com must never call an unperformed transfer right.
 * A future binary-capable handler may replace this explicit failure,
 * but no generic interpretation can claim verified storage meanwhile.
 */

const BINARY_ACTIONS = new Set([
	"fileTransferDownloadBinary",
	"fileTransferUploadBinary"
]);

/**
 * Rejects unimplemented hosted binary operations with a truthful status.
 * @param {string} action - Public action name routed into the hosted OS.
 * @returns {object|null} Typed error or null for unrelated actions.
 */
function guardHostedBinaryAction(action) {
	if (!BINARY_ACTIONS.has(action)) {
		return null;
	}
	return {
		ok: false,
		action,
		status: 501,
		error: "hosted_virtual_os_binary_transfer_unavailable",
		verified: false,
		bytesTransferred: 0,
		retryable: false,
		requiresCapability: "binary-vfs-authorized-storage",
		message: "Hosted Virtual OS has no verified binary handler for this action."
	};
}

module.exports = { guardHostedBinaryAction };
